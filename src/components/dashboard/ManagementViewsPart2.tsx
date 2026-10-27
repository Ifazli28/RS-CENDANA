import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_DISCORD_DUTY_LOG } from '../../data/initialData';
import { DutyLog, RoleName, RoleSalaryConfig, ROLE_LIST, ROLE_LEVELS } from '../../types';
import { compressImageForFirestore } from '../../utils/imageCompressor';
import { LogoRSKotaBaru, LogoKotaBaruRoleplay } from '../BrandAssets';
import {
  FileSpreadsheet,
  Printer,
  Play,
  Upload,
  Plus,
  Clock,
  DollarSign,
  Settings,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Filter,
  Eye,
  X,
} from 'lucide-react';

interface ParsedDutyPreview {
  rawName: string;
  jobTitle: string;
  durationText: string;
  startDate: string;
  endDate: string;
  matchedStaffId: string | null;
  matchedStaffName: string | null;
  matchedRole: RoleName | null;
  durationMinutes: number;
  isValid: boolean;
  errorReason?: string;
}

const formatHoursCompact = (mins: number) => {
  if (mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
};

const formatHoursFull = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} Jam ${m} Menit`;
};

// Helper to compute role-based weekly salary & bonus for a staff member
export function computeStaffWeeklySalary(
  weeklyMinutes: number,
  config: RoleSalaryConfig | undefined
) {
  const dutyHours = Number((weeklyMinutes / 60).toFixed(2));
  if (!config) {
    return {
      dutyHours,
      targetHours: 18,
      meetsTarget: false,
      baseEarned: 0,
      excessHours: 0,
      bonusMultiples: 0,
      dutyBonus: 0,
      totalCalculated: 0,
    };
  }

  const meetsTarget = dutyHours >= config.targetWeeklyHours;
  // Jika memenuhi target jam duty per minggu -> Gaji Utuh; jika tidak -> dihitung per jam
  const baseEarned = meetsTarget
    ? config.fullSalary
    : Math.round(dutyHours * config.hourlyRate);

  // Sistem Bonus: Jika melebihi target jam duty, diberi bonus berdasar kelipatan jam yang diatur
  let excessHours = 0;
  let bonusMultiples = 0;
  let dutyBonus = 0;

  if (dutyHours > config.targetWeeklyHours && config.bonusStepHours > 0) {
    excessHours = Number((dutyHours - config.targetWeeklyHours).toFixed(2));
    bonusMultiples = Math.floor(excessHours / config.bonusStepHours);
    dutyBonus = bonusMultiples * config.bonusPerStepAmount;
  }

  const totalCalculated = baseEarned + dutyBonus;

  return {
    dutyHours,
    targetHours: config.targetWeeklyHours,
    meetsTarget,
    baseEarned,
    excessHours,
    bonusMultiples,
    dutyBonus,
    totalCalculated,
  };
}

// Helper to normalize dates from Discord logs (e.g. DD/MM/YYYY HH:mm:ss or YYYY-MM-DD)
export function parseDiscordDutyDate(dateStr: string): { normalized: string; monthKey: string; dayNum: number; dateOnly: string } {
  if (!dateStr) return { normalized: '', monthKey: '2026-10', dayNum: 17, dateOnly: '2026-10-17' };
  const trimmed = dateStr.trim();
  // Format DD/MM/YYYY HH:mm:ss or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}:\d{1,2}(?::\d{1,2})?))?/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    const time = dmyMatch[4] || '00:00:00';
    return {
      normalized: `${year}-${month}-${day} ${time}`,
      dateOnly: `${year}-${month}-${day}`,
      monthKey: `${year}-${month}`,
      dayNum: parseInt(day, 10),
    };
  }
  // Format YYYY-MM-DD HH:mm:ss or YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}:\d{1,2}(?::\d{1,2})?))?/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    const time = ymdMatch[4] || '00:00:00';
    return {
      normalized: `${year}-${month}-${day} ${time}`,
      dateOnly: `${year}-${month}-${day}`,
      monthKey: `${year}-${month}`,
      dayNum: parseInt(day, 10),
    };
  }
  return {
    normalized: trimmed,
    dateOnly: trimmed.slice(0, 10),
    monthKey: '2026-10',
    dayNum: 17,
  };
}

// 1. DISCORD DUTY PARSER (Sec 66)
export const DutyManagementView: React.FC = () => {
  const { staffAccounts, dutyLogs, addDutyLogsBatch, addToast, deleteDutyLog, requestDelete } = useApp();
  const [rawLogText, setRawLogText] = useState(SAMPLE_DISCORD_DUTY_LOG);
  const [parsedPreview, setParsedPreview] = useState<ParsedDutyPreview[] | null>(null);

  const handleParseDiscordLogs = () => {
    // Split on blocks containing Nama: so multiple discord messages / embeds are cleanly separated
    const rawBlocks = rawLogText
      .split(/(?=Nama\s*:)/i)
      .map((b) => b.trim())
      .filter((b) => /Nama\s*:/i.test(b));

    const blocks = rawBlocks.length > 0
      ? rawBlocks
      : rawLogText.trim().split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

    const results: ParsedDutyPreview[] = blocks.map((block) => {
      const getField = (label: string) => {
        const regex = new RegExp(`${label}\\s*:\\s*([^\\n\\r]+)`, 'i');
        const m = block.match(regex);
        return m ? m[1].trim() : '';
      };

      const rawName = getField('Nama');
      const jobTitle = getField('Pekerjaan') || 'ambulance';
      const durationText = getField('Durasi Bekerja');
      const startDate = getField('Tanggal Mulai');
      const endDate = getField('Tanggal Berakhir');

      let durationMinutes = 0;
      const hMatch = durationText.match(/(\d+)\s*(?:jam|hours?|hrs?|h)\b/i);
      const mMatch = durationText.match(/(\d+)\s*(?:menit|minutes?|mins?|m)\b/i);
      if (hMatch) durationMinutes += parseInt(hMatch[1], 10) * 60;
      if (mMatch) durationMinutes += parseInt(mMatch[1], 10);

      if (durationMinutes === 0) {
        const numOnly = durationText.match(/^\s*(\d+)\s*$/);
        if (numOnly) durationMinutes = parseInt(numOnly[1], 10);
      }

      // Fallback: calculate from start & end date if duration string couldn't be parsed
      if (durationMinutes === 0 && startDate && endDate) {
        try {
          const s = parseDiscordDutyDate(startDate);
          const e = parseDiscordDutyDate(endDate);
          const sMs = new Date(s.normalized.replace(' ', 'T')).getTime();
          const eMs = new Date(e.normalized.replace(' ', 'T')).getTime();
          if (!isNaN(sMs) && !isNaN(eMs) && eMs > sMs) {
            durationMinutes = Math.round((eMs - sMs) / 60000);
          }
        } catch {
          // ignore
        }
      }

      // Clean parenthetical tag (e.g., "Deandra Aditya (deandra)" -> "Deandra Aditya")
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      const tagMatch = rawName.match(/\(([^)]+)\)/);
      const discordTag = tagMatch ? tagMatch[1].trim().toLowerCase() : '';

      const matched = staffAccounts.find((s) => {
        const sLower = s.name.toLowerCase();
        const rawLower = rawName.toLowerCase();
        const cleanLower = cleanName.toLowerCase();
        const emailPrefix = s.email.split('@')[0].toLowerCase();
        return (
          sLower === cleanLower ||
          sLower === rawLower ||
          rawLower.includes(sLower) ||
          (cleanLower.length > 3 && sLower.includes(cleanLower)) ||
          (discordTag && (emailPrefix === discordTag || sLower.includes(discordTag)))
        );
      });

      if (!rawName || !durationText || !startDate || !endDate) {
        return {
          rawName: rawName || 'Tidak Terbaca',
          jobTitle,
          durationText,
          startDate,
          endDate,
          matchedStaffId: null,
          matchedStaffName: null,
          matchedRole: null,
          durationMinutes: 0,
          isValid: false,
          errorReason: 'Format atribut log tidak lengkap',
        };
      }

      if (!matched) {
        return {
          rawName,
          jobTitle,
          durationText,
          startDate,
          endDate,
          matchedStaffId: null,
          matchedStaffName: null,
          matchedRole: null,
          durationMinutes,
          isValid: false,
          errorReason: 'Nama staff tidak ditemukan di database aktif',
        };
      }

      if (durationMinutes <= 0) {
        return {
          rawName,
          jobTitle,
          durationText,
          startDate,
          endDate,
          matchedStaffId: matched.id,
          matchedStaffName: matched.name,
          matchedRole: matched.role,
          durationMinutes: 0,
          isValid: false,
          errorReason: 'Durasi bekerja 0 menit / tidak valid',
        };
      }

      return {
        rawName,
        jobTitle,
        durationText,
        startDate,
        endDate,
        matchedStaffId: matched.id,
        matchedStaffName: matched.name,
        matchedRole: matched.role,
        durationMinutes,
        isValid: true,
      };
    });

    setParsedPreview(results);
    addToast(
      'info',
      'Preview Log Duty Selesai Diproses',
      `Ditemukan ${results.filter((r) => r.isValid).length} log valid dan ${
        results.filter((r) => !r.isValid).length
      } data gagal.`
    );
  };

  const handleConfirmSaveLogs = () => {
    if (!parsedPreview) return;
    const validLogs: Omit<DutyLog, 'id'>[] = parsedPreview
      .filter((p) => p.isValid && p.matchedStaffId && p.matchedRole)
      .map((p) => {
        const startParsed = parseDiscordDutyDate(p.startDate);
        const endParsed = parseDiscordDutyDate(p.endDate);
        return {
          staffId: p.matchedStaffId!,
          staffName: p.matchedStaffName!,
          role: p.matchedRole!,
          jobTitleInLog: p.jobTitle,
          durationMinutes: p.durationMinutes,
          durationFormatted: p.durationText,
          startDate: startParsed.normalized,
          endDate: endParsed.normalized,
          weekKey: 'current-week',
          monthKey: startParsed.monthKey,
        };
      });

    if (validLogs.length === 0) {
      addToast('error', 'Tidak Ada Log Valid', 'Periksa kembali format log Discord Anda atau sesuaikan nama staff.');
      return;
    }

    addDutyLogsBatch(validLogs);
    setParsedPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Discord Duty Parser — Input Log Absensi</h2>
            <p className="text-xs text-slate-500">
              Tempel log duty dari Discord untuk otomatis masuk ke Rekap Absensi Mingguan, Bulanan & Kalkulasi Gaji
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRawLogText(SAMPLE_DISCORD_DUTY_LOG)}
            className="px-3 py-1.5 rounded-lg bg-red-50/40 border border-red-200 text-xs font-semibold text-[#7F1D1D] cursor-pointer self-start"
          >
            Muat Contoh Log Discord
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tempel Log Duty (Satu atau Banyak Pesan Sekaligus)
          </label>
          <textarea
            rows={7}
            value={rawLogText}
            onChange={(e) => setRawLogText(e.target.value)}
            placeholder="Nama: ...\nPekerjaan: ...\nDurasi Bekerja: ...\nTanggal Mulai: ...\nTanggal Berakhir: ..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs focus:border-[#9E1B21] focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleParseDiscordLogs}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Proses & Tampilkan Preview Validasi</span>
          </button>
        </div>

        {parsedPreview && (
          <div className="p-5 rounded-2xl bg-red-50/40 border border-red-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Hasil Preview & Pencocokan Database Staff (Wajib Konfirmasi Sebelum Simpan)
              </h3>
              <span className="text-xs font-semibold text-slate-600">
                Valid: {parsedPreview.filter((p) => p.isValid).length} · Gagal:{' '}
                {parsedPreview.filter((p) => !p.isValid).length}
              </span>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-red-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-red-100 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">Nama di Log</th>
                    <th className="py-2.5 px-3">Pekerjaan</th>
                    <th className="py-2.5 px-3">Durasi</th>
                    <th className="py-2.5 px-3">Mulai — Berakhir</th>
                    <th className="py-2.5 px-3">Status Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {parsedPreview.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.rawName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.jobTitle}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#7F1D1D]">
                        {item.durationText} ({item.durationMinutes} mnt)
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {item.startDate} → {item.endDate}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.isValid ? (
                          <span className="text-[#20C997] font-bold">
                            ✓ Cocok ({item.matchedStaffName} · {item.matchedRole})
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-rose-600 font-bold block text-[11px]">
                              ✗ {item.errorReason}
                            </span>
                            <select
                              onChange={(e) => {
                                const st = staffAccounts.find((s) => s.id === e.target.value);
                                if (st) {
                                  setParsedPreview((prev) =>
                                    prev
                                      ? prev.map((p, pIdx) =>
                                          pIdx === idx
                                            ? {
                                                ...p,
                                                matchedStaffId: st.id,
                                                matchedStaffName: st.name,
                                                matchedRole: st.role,
                                                isValid: p.durationMinutes > 0,
                                                errorReason: undefined,
                                              }
                                            : p
                                        )
                                      : null
                                  );
                                }
                              }}
                              className="text-[11px] p-1.5 rounded-lg border border-red-200 bg-white"
                            >
                              <option value="">Pilih staff secara manual...</option>
                              {staffAccounts
                                .filter((s) => s.status === 'Active')
                                .map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} ({s.role})
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setParsedPreview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveLogs}
                className="px-6 py-2 rounded-xl bg-[#20C997] text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
              >
                Confirm & Simpan ke Database Duty
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Riwayat Sesi Log Duty Terbaru */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Sesi Log Duty Terbaru</h3>
            <p className="text-xs text-slate-500">Total {dutyLogs.length} sesi tercatat di database</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F1E36] text-white uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 rounded-tl-xl">#</th>
                <th className="py-3 px-4">NAMA TENAGA MEDIS</th>
                <th className="py-3 px-4">JABATAN</th>
                <th className="py-3 px-4">WAKTU MULAI — SELESAI</th>
                <th className="py-3 px-4 text-right rounded-tr-xl text-[#FBBF24]">DURASI SESI / AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dutyLogs.slice(0, 15).map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.staffName}</td>
                  <td className="py-3 px-4 text-slate-600">{log.role}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {log.startDate} → {log.endDate}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <span className="font-mono font-bold text-slate-900">{log.durationFormatted}</span>
                      <button
                        onClick={() => {
                          requestDelete(
                            'Hapus Log Sesi Duty',
                            `Apakah Anda yakin ingin menghapus log sesi duty ${log.staffName} (${log.durationFormatted})?`,
                            () => deleteDutyLog(log.id)
                          );
                        }}
                        title="Hapus Log Duty"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. MENU TERPISAH: REKAP ABSENSI MINGGUAN (Format Tabel Sesuai Gambar User: # | NAMA TENAGA MEDIS | JABATAN | SEN 05 .. MIN 11 | TOTAL JAM)
export const WeeklyAttendanceRecapView: React.FC = () => {
  const { staffAccounts, dutyLogs, roleSalaryConfigs, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [weekStartStr, setWeekStartStr] = useState('2026-10-05'); // Senin 05

  // Generate 7 days from selected Monday (SEN, SEL, RAB, KAM, JUM, SAB, MIN)
  const weekDays = React.useMemo(() => {
    const dayLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
    const base = new Date(`${weekStartStr}T00:00:00`);
    return dayLabels.map((label, idx) => {
      const d = new Date(base);
      d.setDate(base.getDate() + idx);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return {
        label,
        dateNum: dd,
        fullDate: `${yyyy}-${mm}-${dd}`,
        dayOfWeekIndex: idx, // 0 = Senin .. 6 = Minggu
      };
    });
  }, [weekStartStr]);

  const weeklyRows = React.useMemo(() => {
    const activeStaff = staffAccounts
      .filter((s) => s.status === 'Active')
      .sort((a, b) => b.level - a.level);

    return activeStaff
      .map((st) => {
        const dayMinutes = [0, 0, 0, 0, 0, 0, 0]; // SEN..MIN
        const staffLogs = dutyLogs.filter((l) => l.staffId === st.id);

        staffLogs.forEach((l) => {
          const norm = parseDiscordDutyDate(l.startDate);
          const exactDayIdx = weekDays.findIndex((wd) => wd.fullDate === norm.dateOnly);
          if (exactDayIdx !== -1) {
            dayMinutes[exactDayIdx] += l.durationMinutes;
          } else {
            const parsed = new Date(norm.normalized.replace(' ', 'T'));
            if (!isNaN(parsed.getTime())) {
              const jsDay = parsed.getDay(); // 0=Sun, 1=Mon...
              const monBasedIdx = jsDay === 0 ? 6 : jsDay - 1;
              if (monBasedIdx >= 0 && monBasedIdx <= 6) {
                dayMinutes[monBasedIdx] += l.durationMinutes;
              }
            }
          }
        });

        const totalMinutes = dayMinutes.reduce((a, b) => a + b, 0);
        const roleCfg = roleSalaryConfigs.find((c) => c.role === st.role);
        const targetWeeklyHours = roleCfg?.targetWeeklyHours ?? 18;

        return {
          staffId: st.id,
          staffName: st.name,
          role: st.role,
          level: st.level,
          dayMinutes,
          totalMinutes,
          targetWeeklyHours,
        };
      })
      .filter((r) => (roleFilter === 'Semua' ? true : r.role === roleFilter))
      .filter((r) => r.staffName.toLowerCase().includes(search.toLowerCase()));
  }, [staffAccounts, dutyLogs, weekDays, weekStartStr, roleSalaryConfigs, roleFilter, search]);

  const handleExportWeeklyExcel = () => {
    const xmlRows = weeklyRows
      .map(
        (r, i) => `
      <Row>
        <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell><Data ss:Type="String">${r.staffName}</Data></Cell>
        <Cell><Data ss:Type="String">${r.role}</Data></Cell>
        ${r.dayMinutes
          .map((m) => `<Cell><Data ss:Type="String">${formatHoursCompact(m)}</Data></Cell>`)
          .join('')}
        <Cell><Data ss:Type="String">${formatHoursFull(r.totalMinutes)}</Data></Cell>
      </Row>`
      )
      .join('');

    const excelContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Rekap Absensi Mingguan">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">#</Data></Cell>
    <Cell><Data ss:Type="String">NAMA TENAGA MEDIS</Data></Cell>
    <Cell><Data ss:Type="String">JABATAN</Data></Cell>
    ${weekDays
      .map((d) => `<Cell><Data ss:Type="String">${d.label} (${d.dateNum})</Data></Cell>`)
      .join('')}
    <Cell><Data ss:Type="String">TOTAL JAM</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelContent], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Absensi_Mingguan_${weekStartStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Export Excel Berhasil', 'File Rekap Absensi Mingguan telah diunduh.');
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Rekap Absensi Mingguan Tenaga Medis
          </h2>
          <p className="text-xs text-slate-500">
            Rekapitulasi jam duty harian (Senin s/d Minggu) beserta status pencapaian target jam mingguan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-red-50/40 px-3 py-1.5 rounded-xl border border-red-100">
            <span className="text-[11px] font-bold text-slate-600">Mulai Senin:</span>
            <input
              type="date"
              value={weekStartStr}
              onChange={(e) => setWeekStartStr(e.target.value)}
              className="text-xs font-mono font-bold text-[#7F1D1D] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekStartStr('2026-10-05')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                weekStartStr === '2026-10-05'
                  ? 'bg-[#9E1B21] text-white border-[#9E1B21]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              05–11 Okt
            </button>
            <button
              type="button"
              onClick={() => setWeekStartStr('2026-10-12')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                weekStartStr === '2026-10-12'
                  ? 'bg-[#9E1B21] text-white border-[#9E1B21]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              12–18 Okt (Terbaru)
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama tenaga medis..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#9E1B21] focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="Semua">Semua Jabatan</option>
            {Array.from(new Set(staffAccounts.map((s) => s.role))).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportWeeklyExcel}
            className="px-3.5 py-2 rounded-xl bg-[#20C997] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabel Rekap Absensi Mingguan Sesuai Gambar Referensi User */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1E36] text-white select-none">
                <th className="py-4 px-4 text-xs font-extrabold tracking-wider w-12 text-center">#</th>
                <th className="py-4 px-5 text-xs font-extrabold tracking-wider min-w-[220px]">
                  NAMA TENAGA MEDIS
                </th>
                <th className="py-4 px-4 text-xs font-extrabold tracking-wider min-w-[160px]">
                  JABATAN
                </th>
                {weekDays.map((d) => (
                  <th key={d.label} className="py-3.5 px-3 text-center min-w-[78px]">
                    <div className="text-xs font-extrabold tracking-wider text-white">
                      {d.label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{d.dateNum}</div>
                  </th>
                ))}
                <th className="py-4 px-5 text-center bg-[#091526] min-w-[130px]">
                  <span className="text-xs font-extrabold tracking-wider text-[#FBBF24]">
                    TOTAL JAM
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {weeklyRows.map((row, idx) => {
                const totalHoursNum = row.totalMinutes / 60;
                const meetsTarget = totalHoursNum >= row.targetWeeklyHours;
                return (
                  <tr
                    key={row.staffId}
                    className="hover:bg-slate-50/90 transition"
                  >
                    <td className="py-4 px-4 font-mono text-xs text-slate-400 text-center tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{row.staffName}</div>
                      <div className="text-[11px] text-slate-400">
                        Target Mingguan: {row.targetWeeklyHours} Jam
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {row.role}
                      </span>
                    </td>
                    {row.dayMinutes.map((mins, dIdx) => (
                      <td
                        key={dIdx}
                        className="py-4 px-3 text-center font-mono text-xs tabular-nums"
                      >
                        {mins > 0 ? (
                          <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                            {formatHoursCompact(mins)}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-4 px-5 text-center bg-slate-900/[0.03] font-mono tabular-nums">
                      <div
                        className={`text-sm font-extrabold ${
                          meetsTarget ? 'text-[#0F1E36]' : 'text-amber-600'
                        }`}
                      >
                        {formatHoursCompact(row.totalMinutes)}
                      </div>
                      <div
                        className={`text-[10px] font-sans font-bold mt-0.5 ${
                          meetsTarget ? 'text-[#20C997]' : 'text-amber-600'
                        }`}
                      >
                        {meetsTarget ? '✓ Target Tercapai' : `Kurang ${(row.targetWeeklyHours - totalHoursNum).toFixed(1)}j`}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. MENU TERPISAH: REKAP ABSENSI BULANAN (Format Tabel Seragam Dark Navy Header: MG 1 .. MG 4/5 | TOTAL JAM)
export const MonthlyAttendanceRecapView: React.FC = () => {
  const { staffAccounts, dutyLogs, roleSalaryConfigs, addToast } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');

  const monthWeeks = [
    { label: 'MG 1', sub: '01–07' },
    { label: 'MG 2', sub: '08–14' },
    { label: 'MG 3', sub: '15–21' },
    { label: 'MG 4', sub: '22–28' },
    { label: 'MG 5', sub: '29–31' },
  ];

  const monthlyRows = React.useMemo(() => {
    const activeStaff = staffAccounts
      .filter((s) => s.status === 'Active')
      .sort((a, b) => b.level - a.level);

    return activeStaff
      .map((st) => {
        const weekBuckets = [0, 0, 0, 0, 0]; // MG 1..MG 5
        let sessionsCount = 0;

        dutyLogs
          .filter(
            (l) =>
              l.staffId === st.id &&
              (l.monthKey === selectedMonth || parseDiscordDutyDate(l.startDate).monthKey === selectedMonth)
          )
          .forEach((l) => {
            sessionsCount += 1;
            const dayNum = parseDiscordDutyDate(l.startDate).dayNum;
            if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
              const bucketIdx = Math.min(4, Math.floor((dayNum - 1) / 7));
              weekBuckets[bucketIdx] += l.durationMinutes;
            } else {
              weekBuckets[0] += l.durationMinutes;
            }
          });

        const totalMinutes = weekBuckets.reduce((a, b) => a + b, 0);
        const roleCfg = roleSalaryConfigs.find((c) => c.role === st.role);
        const monthlyTargetHours = (roleCfg?.targetWeeklyHours ?? 18) * 4;

        return {
          staffId: st.id,
          staffName: st.name,
          role: st.role,
          weekBuckets,
          sessionsCount,
          totalMinutes,
          monthlyTargetHours,
        };
      })
      .filter((r) => (roleFilter === 'Semua' ? true : r.role === roleFilter))
      .filter((r) => r.staffName.toLowerCase().includes(search.toLowerCase()));
  }, [staffAccounts, dutyLogs, selectedMonth, roleSalaryConfigs, roleFilter, search]);

  const handleExportMonthlyExcel = () => {
    const xmlRows = monthlyRows
      .map(
        (r, i) => `
      <Row>
        <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell><Data ss:Type="String">${r.staffName}</Data></Cell>
        <Cell><Data ss:Type="String">${r.role}</Data></Cell>
        ${r.weekBuckets
          .map((m) => `<Cell><Data ss:Type="String">${formatHoursCompact(m)}</Data></Cell>`)
          .join('')}
        <Cell><Data ss:Type="String">${formatHoursFull(r.totalMinutes)}</Data></Cell>
      </Row>`
      )
      .join('');

    const excelContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Rekap Absensi Bulanan">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">#</Data></Cell>
    <Cell><Data ss:Type="String">NAMA TENAGA MEDIS</Data></Cell>
    <Cell><Data ss:Type="String">JABATAN</Data></Cell>
    ${monthWeeks
      .map((w) => `<Cell><Data ss:Type="String">${w.label} (${w.sub})</Data></Cell>`)
      .join('')}
    <Cell><Data ss:Type="String">TOTAL JAM</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelContent], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Absensi_Bulanan_${selectedMonth}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Export Excel Bulanan Berhasil', 'File Rekap Absensi Bulanan telah diunduh.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Rekap Absensi Bulanan Tenaga Medis
          </h2>
          <p className="text-xs text-slate-500">
            Akumulasi jam duty mingguan (Minggu 1 s/d Minggu 5) dalam periode satu bulan penuh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-red-50/40 px-3 py-1.5 rounded-xl border border-red-100">
            <span className="text-[11px] font-bold text-slate-600">Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-mono font-bold text-[#7F1D1D] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama tenaga medis..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#9E1B21] focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="Semua">Semua Jabatan</option>
            {Array.from(new Set(staffAccounts.map((s) => s.role))).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportMonthlyExcel}
            className="px-3.5 py-2 rounded-xl bg-[#20C997] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabel Rekap Absensi Bulanan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1E36] text-white select-none">
                <th className="py-4 px-4 text-xs font-extrabold tracking-wider w-12 text-center">#</th>
                <th className="py-4 px-5 text-xs font-extrabold tracking-wider min-w-[220px]">
                  NAMA TENAGA MEDIS
                </th>
                <th className="py-4 px-4 text-xs font-extrabold tracking-wider min-w-[160px]">
                  JABATAN
                </th>
                {monthWeeks.map((w) => (
                  <th key={w.label} className="py-3.5 px-3 text-center min-w-[90px]">
                    <div className="text-xs font-extrabold tracking-wider text-white">
                      {w.label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">Tgl {w.sub}</div>
                  </th>
                ))}
                <th className="py-4 px-5 text-center bg-[#091526] min-w-[140px]">
                  <span className="text-xs font-extrabold tracking-wider text-[#FBBF24]">
                    TOTAL JAM
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {monthlyRows.map((row, idx) => (
                <tr key={row.staffId} className="hover:bg-slate-50/90 transition">
                  <td className="py-4 px-4 font-mono text-xs text-slate-400 text-center tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900">{row.staffName}</div>
                    <div className="text-[11px] text-slate-400">
                      {row.sessionsCount} Sesi Duty Bulan Ini
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      {row.role}
                    </span>
                  </td>
                  {row.weekBuckets.map((mins, wIdx) => (
                    <td
                      key={wIdx}
                      className="py-4 px-3 text-center font-mono text-xs tabular-nums"
                    >
                      {mins > 0 ? (
                        <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                          {formatHoursCompact(mins)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  ))}
                  <td className="py-4 px-5 text-center bg-slate-900/[0.03] font-mono tabular-nums">
                    <div className="text-sm font-extrabold text-[#0F1E36]">
                      {formatHoursCompact(row.totalMinutes)}
                    </div>
                    <div className="text-[10px] font-sans text-slate-500 mt-0.5">
                      {formatHoursFull(row.totalMinutes)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 4. PAYROLL MANAGEMENT & SKEMA GAJI BERDASARKAN JABATAN (Sec 69 — Heads+ Level 8+)
export const PayrollManagementView: React.FC = () => {
  const {
    staffAccounts,
    dutyLogs,
    payrollRecords,
    roleSalaryConfigs,
    updateRoleSalaryConfig,
    addOrUpdatePayroll,
    addToast,
    deletePayrollRecord,
    requestDelete,
  } = useApp();

  // Pengaturan gaji dipusatkan pada skema jabatan (role-config) sebagai tab utama
  const [activeTab, setActiveTab] = useState<'role-config' | 'weekly-payroll'>('role-config');
  const [editingRoleConfig, setEditingRoleConfig] = useState<RoleSalaryConfig | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Printable Slip Modal State
  const [previewSlip, setPreviewSlip] = useState<{
    staffName: string;
    role: RoleName;
    period: string;
    dutyHours: number;
    basicSalary: number;
    dutyBonus: number;
    allowance: number;
    deduction: number;
    totalSalary: number;
    paymentStatus: string;
    paidAt?: string;
  } | null>(null);

  // State for updating staff payment status & allowances (Base salary & bonus are strictly locked from role config)
  const [editingStaffPay, setEditingStaffPay] = useState<{
    staffId: string;
    staffName: string;
    role: RoleName;
    level: number;
    existingPayId?: string;
    dutyHours: number;
    targetHours: number;
    hourlyRate: number;
    meetsTarget: boolean;
    baseEarned: number;
    dutyBonus: number;
    bonusMultiples: number;
    allowance: number;
    deduction: number;
    paymentStatus: 'Paid' | 'Pending' | 'Processing';
  } | null>(null);

  // Compute live weekly payroll rows for all active staff based strictly on their role config & weekly duty logs
  const allStaffPayrollRows = React.useMemo(() => {
    const activeStaff = staffAccounts
      .filter((s) => s.status === 'Active')
      .sort((a, b) => b.level - a.level);

    return activeStaff.map((st) => {
      // Aggregates weekly logs by ID or by Staff Name for robust Discord parser matching
      const weeklyMins = dutyLogs
        .filter(
          (l) =>
            (l.staffId === st.id ||
              l.staffName.toLowerCase().trim() === st.name.toLowerCase().trim()) &&
            l.weekKey === 'current-week'
        )
        .reduce((acc, l) => acc + l.durationMinutes, 0);

      const roleCfg = roleSalaryConfigs.find((c) => c.role === st.role);
      const calc = computeStaffWeeklySalary(weeklyMins, roleCfg);
      const savedPay = payrollRecords.find((p) => p.staffId === st.id);

      const allowance = savedPay?.allowance ?? 0;
      const deduction = savedPay?.deduction ?? 0;
      const finalTotal = calc.baseEarned + calc.dutyBonus + allowance - deduction;

      return {
        staff: st,
        roleCfg,
        calc,
        savedPay,
        allowance,
        deduction,
        finalTotal,
        paymentStatus: savedPay?.paymentStatus ?? ('Pending' as const),
      };
    });
  }, [staffAccounts, dutyLogs, roleSalaryConfigs, payrollRecords]);

  // Filtered rows for UI
  const filteredStaffPayrollRows = React.useMemo(() => {
    return allStaffPayrollRows.filter((row) => {
      if (roleFilter !== 'ALL' && row.staff.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && row.paymentStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = row.staff.name.toLowerCase().includes(q);
        const matchRole = row.staff.role.toLowerCase().includes(q);
        if (!matchName && !matchRole) return false;
      }
      return true;
    });
  }, [allStaffPayrollRows, roleFilter, statusFilter, searchQuery]);

  // Summary Metrics
  const summaryMetrics = React.useMemo(() => {
    const totalStaff = allStaffPayrollRows.length;
    const meetsTargetCount = allStaffPayrollRows.filter((r) => r.calc.meetsTarget).length;
    const belowTargetCount = totalStaff - meetsTargetCount;
    const totalPayrollAmount = allStaffPayrollRows.reduce((acc, r) => acc + r.finalTotal, 0);
    const totalBonusAmount = allStaffPayrollRows.reduce((acc, r) => acc + r.calc.dutyBonus, 0);

    return {
      totalStaff,
      meetsTargetCount,
      belowTargetCount,
      totalPayrollAmount,
      totalBonusAmount,
    };
  }, [allStaffPayrollRows]);

  const handleSyncAllCalculatedToPayroll = () => {
    allStaffPayrollRows.forEach((row) => {
      addOrUpdatePayroll(
        {
          staffId: row.staff.id,
          staffName: row.staff.name,
          role: row.staff.role,
          period: 'Minggu Ini (Okt 2026)',
          basicSalary: row.calc.baseEarned,
          dutyHours: row.calc.dutyHours,
          dutyBonus: row.calc.dutyBonus,
          allowance: row.allowance,
          deduction: row.deduction,
          totalSalary: row.finalTotal,
          paymentStatus: row.paymentStatus,
          paidAt: row.paymentStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined,
        },
        row.savedPay?.id
      );
    });
    addToast(
      'success',
      'Kalkulasi Gaji Mingguan Disinkronkan',
      'Seluruh slip gaji staff telah diperbarui berdasarkan jam duty mingguan & skema jabatan ke Database Cloud.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Tab Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#9E1B21] text-white">
              PENGATURAN SKEMA GAJI BERDASARKAN JABATAN
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Sistem Penggajian Terpusat Berdasarkan Jabatan (Bukan Perorangan)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nominal gaji pokok, target jam duty mingguan, tarif per jam, dan bonus kelipatan diatur murni di level <strong>Jabatan</strong>. Seluruh staff otomatis mengikuti skema jabatannya.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-red-50/40 rounded-xl border border-red-100 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('role-config')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'role-config'
                ? 'bg-[#9E1B21] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#7F1D1D]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Atur Skema 12 Jabatan</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly-payroll')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'weekly-payroll'
                ? 'bg-[#9E1B21] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#7F1D1D]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rekap Gaji & Slip Staff</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENGATURAN SKEMA GAJI PER JABATAN (12 ROLES) - PUSAT PENGATURAN GAJI */}
      {activeTab === 'role-config' && (
        <div className="space-y-4">
          {/* Policy Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <Settings className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-blue-950 text-sm">
                Prinsip Penggajian RS Kota Baru: Pengaturan Mengikat Pada Jabatan, Bukan Perorangan
              </h4>
              <p className="text-blue-800 leading-relaxed">
                Di RS Kota Baru, <strong>gaji tidak pernah diatur atau ditentukan perorangan</strong>. Seluruh hak gaji dihitung secara sistemik berdasarkan skema jabatan di bawah ini:
              </p>
              <ul className="list-disc list-inside text-blue-900 font-medium space-y-0.5 pl-1">
                <li><strong>Gaji Utuh</strong>: Diberikan jika staff memenuhi target jam duty mingguan jabatan tersebut.</li>
                <li><strong>Gaji Per Jam</strong>: Diberikan jika jam duty kurang dari target mingguan (&times; tarif per jam jabatan).</li>
                <li><strong>Bonus Kelipatan Jam</strong>: Diberikan untuk kelebihan jam duty di atas target (&times; nominal bonus jabatan).</li>
              </ul>
              <p className="text-[11px] text-blue-700 italic pt-1">
                Setiap perubahan pada skema jabatan akan otomatis langsung memperbarui perhitungan gaji seluruh tenaga medis pada jabatan terkait secara real-time.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-red-50/40">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tabel Skema Penggajian Resmi 12 Tingkat Jabatan RS Kota Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Klik tombol <strong>Atur Skema</strong> pada jabatan untuk mengatur target jam, gaji utuh, tarif per jam, serta bonus lembur.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-white rounded-lg border border-red-200 text-[#9E1B21]">
                12 Jabatan Terkonfigurasi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1E36] text-white text-[11px] font-extrabold tracking-wider uppercase">
                    <th className="py-3.5 px-4 text-center w-12">LV</th>
                    <th className="py-3.5 px-4">JABATAN RESMI (ROLE)</th>
                    <th className="py-3.5 px-4 text-center">STAFF TERDAMPAK</th>
                    <th className="py-3.5 px-4 text-center">TARGET DUTY / MINGGU</th>
                    <th className="py-3.5 px-4 text-right">GAJI UTUH (CAPAI TARGET)</th>
                    <th className="py-3.5 px-4 text-right">GAJI PER JAM (&lt; TARGET)</th>
                    <th className="py-3.5 px-4 text-center">KELIPATAN BONUS</th>
                    <th className="py-3.5 px-4 text-right text-[#FBBF24]">NOMINAL BONUS / KELIPATAN</th>
                    <th className="py-3.5 px-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm tabular-nums">
                  {[...roleSalaryConfigs]
                    .sort((a, b) => b.level - a.level)
                    .map((cfg) => {
                      const staffCount = staffAccounts.filter(
                        (s) => s.role === cfg.role && s.status === 'Active'
                      ).length;

                      return (
                        <tr key={cfg.role} className="hover:bg-red-50/30 transition">
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            <span className="inline-block w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-extrabold">
                              {cfg.level}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{cfg.role}</div>
                            <div className="text-[10px] text-slate-400">
                              {cfg.level >= 8 ? 'Heads of Department & Pimpinan' : 'Tenaga Medis & Paramedic'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                staffCount > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {staffCount} Staff Aktif
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                              {cfg.targetWeeklyHours} Jam / Minggu
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                            ${cfg.fullSalary.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-amber-700 font-semibold">
                            ${cfg.hourlyRate.toLocaleString()} / jam
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                            Setiap +{cfg.bonusStepHours} Jam
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#7F1D1D]">
                            +${cfg.bonusPerStepAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setEditingRoleConfig({ ...cfg })}
                              className="px-3 py-1.5 rounded-lg bg-[#9E1B21] hover:bg-[#85161B] text-white text-xs font-bold cursor-pointer transition shadow-xs"
                            >
                              Atur Skema
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP GAJI & SLIP GAJI STAFF (OTOMATIS DARI SKEMA JABATAN) */}
      {activeTab === 'weekly-payroll' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Penggajian Minggu Ini</span>
              <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                ${summaryMetrics.totalPayrollAmount.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">Total Take Home Pay {summaryMetrics.totalStaff} staff</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs">
              <span className="text-[10px] text-emerald-600 uppercase font-bold block">Memenuhi Target Jam</span>
              <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
                {summaryMetrics.meetsTargetCount} <span className="text-sm font-sans font-semibold text-slate-500">/ {summaryMetrics.totalStaff}</span>
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Berhak Gaji Utuh Jabatan</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs">
              <span className="text-[10px] text-amber-600 uppercase font-bold block">Kurang Dari Target</span>
              <p className="text-2xl font-extrabold font-mono text-amber-700 mt-1">
                {summaryMetrics.belowTargetCount} <span className="text-sm font-sans font-semibold text-slate-500">Staff</span>
              </p>
              <span className="text-[11px] text-amber-600 font-semibold">Dihitung tarif per jam jabatan</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs">
              <span className="text-[10px] text-purple-600 uppercase font-bold block">Total Bonus Lembur</span>
              <p className="text-2xl font-extrabold font-mono text-purple-700 mt-1">
                +${summaryMetrics.totalBonusAmount.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">Dihitung kelipatan lembur jabatan</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
            {/* Controls Bar: Search, Filters, and Sync Action */}
            <div className="p-5 border-b border-red-100 bg-red-50/30 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kalkulasi Otomatis Gaji Mingguan Seluruh Staff
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gaji pokok dan bonus lembur dihitung 100% otomatis dari Skema Jabatan yang berlaku dan jam duty log minggu berjalan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab('role-config')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-red-200 text-[#7F1D1D] text-xs font-bold hover:bg-red-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Ubah Skema Gaji Jabatan</span>
                  </button>
                  <button
                    onClick={handleSyncAllCalculatedToPayroll}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terbitkan / Update Semua Slip Gaji ke Cloud</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Cari nama staff medis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#9E1B21]"
                  />
                </div>

                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  >
                    <option value="ALL">Semua Jabatan (12 Jabatan)</option>
                    {ROLE_LIST.map((role) => (
                      <option key={role} value={role}>
                        Level {ROLE_LEVELS[role]} · {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  >
                    <option value="ALL">Semua Status Pembayaran</option>
                    <option value="Paid">Sudah Dibayar (Paid)</option>
                    <option value="Processing">Diproses (Processing)</option>
                    <option value="Pending">Menunggu (Pending)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1E36] text-white text-[11px] font-extrabold tracking-wider uppercase">
                    <th className="py-3.5 px-4">TENAGA MEDIS & JABATAN</th>
                    <th className="py-3.5 px-4 text-center">JAM DUTY / TARGET JABATAN</th>
                    <th className="py-3.5 px-4 text-center">SKEMA CAPAIAN</th>
                    <th className="py-3.5 px-4 text-right">GAJI POKOK (DARI JABATAN)</th>
                    <th className="py-3.5 px-4 text-right">BONUS LEMBUR (DARI JABATAN)</th>
                    <th className="py-3.5 px-4 text-right">TUNJANGAN / POTONGAN</th>
                    <th className="py-3.5 px-4 text-right text-[#FBBF24]">TAKE HOME PAY</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                    <th className="py-3.5 px-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm tabular-nums">
                  {filteredStaffPayrollRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-xs text-slate-500">
                        Tidak ada data staff yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStaffPayrollRows.map((row) => (
                      <tr key={row.staff.id} className="hover:bg-red-50/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{row.staff.name}</div>
                          <div className="text-[11px] text-[#9E1B21] font-semibold flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block px-1.5 py-0.5 rounded-sm bg-red-100 text-[#9E1B21] text-[10px] font-bold">
                              LV {row.staff.level}
                            </span>
                            <span>{row.staff.role}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <div className="font-extrabold text-slate-900">
                            {row.calc.dutyHours}j <span className="text-slate-400 font-normal">/ {row.calc.targetHours}j</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {Math.round((row.calc.dutyHours / row.calc.targetHours) * 100)}% target {row.staff.role}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.calc.meetsTarget ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Gaji Utuh
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Per Jam (${row.roleCfg?.hourlyRate}/j)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          ${row.calc.baseEarned.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="font-bold text-emerald-600">
                            +${row.calc.dutyBonus.toLocaleString()}
                          </div>
                          {row.calc.bonusMultiples > 0 && (
                            <div className="text-[10px] text-slate-400">
                              +{row.calc.excessHours}j ({row.calc.bonusMultiples}x)
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs">
                          <span className="text-emerald-600">+${row.allowance.toLocaleString()}</span>
                          {' / '}
                          <span className="text-rose-600">-${row.deduction.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                          ${row.finalTotal.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              row.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.paymentStatus === 'Processing'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {row.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setPreviewSlip({
                                  staffName: row.staff.name,
                                  role: row.staff.role,
                                  period: 'Minggu Ini (Okt 2026)',
                                  dutyHours: row.calc.dutyHours,
                                  basicSalary: row.calc.baseEarned,
                                  dutyBonus: row.calc.dutyBonus,
                                  allowance: row.allowance,
                                  deduction: row.deduction,
                                  totalSalary: row.finalTotal,
                                  paymentStatus: row.paymentStatus,
                                  paidAt: row.savedPay?.paidAt,
                                })
                              }
                              title="Pratinjau / Cetak Slip"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setEditingStaffPay({
                                  staffId: row.staff.id,
                                  staffName: row.staff.name,
                                  role: row.staff.role,
                                  level: row.staff.level,
                                  existingPayId: row.savedPay?.id,
                                  dutyHours: row.calc.dutyHours,
                                  targetHours: row.calc.targetHours,
                                  hourlyRate: row.roleCfg?.hourlyRate ?? 350,
                                  meetsTarget: row.calc.meetsTarget,
                                  baseEarned: row.calc.baseEarned,
                                  dutyBonus: row.calc.dutyBonus,
                                  bonusMultiples: row.calc.bonusMultiples,
                                  allowance: row.allowance,
                                  deduction: row.deduction,
                                  paymentStatus: row.paymentStatus,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-red-50/60 hover:bg-red-100 text-[#7F1D1D] text-xs font-bold cursor-pointer transition border border-red-200/60"
                            >
                              Status / Bayar
                            </button>
                            {row.savedPay && (
                              <button
                                onClick={() => {
                                  if (!row.savedPay) return;
                                  const payId = row.savedPay.id;
                                  requestDelete(
                                    'Hapus Slip Gaji',
                                    `Apakah Anda yakin ingin menghapus rekam slip gaji milik ${row.staff.name}?`,
                                    () => deletePayrollRecord(payId)
                                  );
                                }}
                                title="Hapus Rekam Slip Gaji"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT SKEMA GAJI JABATAN */}
      {editingRoleConfig && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingRoleConfig(null)}
        >
          <div
            className="bg-white rounded-2xl border border-red-100 p-6 max-w-lg w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-red-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E1B21]">
                LEVEL {editingRoleConfig.level} · PENGATURAN SKEMA GAJI JABATAN
              </span>
              <h3 className="text-lg font-bold text-slate-900">{editingRoleConfig.role}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengaturan ini berlaku otomatis untuk seluruh tenaga medis dengan jabatan <strong>{editingRoleConfig.role}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Jam Duty Per Minggu (Jam) *
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.5"
                  value={editingRoleConfig.targetWeeklyHours}
                  onChange={(e) =>
                    setEditingRoleConfig({
                      ...editingRoleConfig,
                      targetWeeklyHours: Math.max(0.5, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-300 bg-white text-sm font-mono font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Jika jam duty mingguan staff mencapai nilai ini, staff mendapat <strong>Gaji Utuh</strong>. Jika kurang, dihitung <strong>Gaji Per Jam</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gaji Utuh ($) — Capai Target
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingRoleConfig.fullSalary}
                  onChange={(e) =>
                    setEditingRoleConfig({
                      ...editingRoleConfig,
                      fullSalary: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gaji Per Jam ($/Jam) — Di Bawah Target
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingRoleConfig.hourlyRate}
                  onChange={(e) =>
                    setEditingRoleConfig({
                      ...editingRoleConfig,
                      hourlyRate: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kelipatan Jam Bonus (Jam)
                </label>
                <input
                  type="number"
                  min={0.5}
                  step="0.5"
                  value={editingRoleConfig.bonusStepHours}
                  onChange={(e) =>
                    setEditingRoleConfig({
                      ...editingRoleConfig,
                      bonusStepHours: Math.max(0.5, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Contoh: 2 = bonus cair setiap kelebihan 2 jam dari target
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Bonus per Kelipatan ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingRoleConfig.bonusPerStepAmount}
                  onChange={(e) =>
                    setEditingRoleConfig({
                      ...editingRoleConfig,
                      bonusPerStepAmount: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nominal bonus yang didapat per 1x kelipatan jam
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRoleConfig(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateRoleSalaryConfig(editingRoleConfig);
                  setEditingRoleConfig(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Simpan Skema Jabatan ke Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATUS PEMBAYARAN & TUNJANGAN (GAJI POKOK & BONUS TERKUNCI OTOMATIS DARI SKEMA JABATAN) */}
      {editingStaffPay && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingStaffPay(null)}
        >
          <div
            className="bg-white rounded-2xl border border-red-100 p-6 max-w-md w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-red-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E1B21] block">
                STATUS PEMBAYARAN & TUNJANGAN STAFF
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {editingStaffPay.staffName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jabatan: <strong className="text-[#9E1B21]">{editingStaffPay.role} (Level {editingStaffPay.level})</strong> · Jam Duty: <strong>{editingStaffPay.dutyHours} Jam</strong>
              </p>
            </div>

            {/* Read-Only Role-Locked Salary Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Gaji Pokok (Terkunci dari Jabatan):</span>
                <strong className="font-mono text-slate-900 text-sm">
                  ${editingStaffPay.baseEarned.toLocaleString()}
                </strong>
              </div>
              <div className="text-[11px] text-slate-400">
                {editingStaffPay.meetsTarget ? (
                  <span className="text-emerald-600 font-semibold">
                    ✓ Memenuhi target mingguan ({editingStaffPay.targetHours}j) &rarr; Berhak Gaji Utuh {editingStaffPay.role}
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold">
                    &bull; Kurang target &rarr; Dihitung {editingStaffPay.dutyHours}j &times; ${editingStaffPay.hourlyRate}/jam
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500">Bonus Lembur (Terkunci dari Jabatan):</span>
                <strong className="font-mono text-emerald-600 text-sm">
                  +${editingStaffPay.dutyBonus.toLocaleString()}
                </strong>
              </div>
              {editingStaffPay.bonusMultiples > 0 && (
                <div className="text-[11px] text-slate-400">
                  {editingStaffPay.bonusMultiples}x kelipatan jam lembur jabatan
                </div>
              )}
            </div>

            {/* Editable Adjustments: Allowance, Deduction, Payment Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tunjangan Tambahan ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingStaffPay.allowance}
                  onChange={(e) =>
                    setEditingStaffPay({ ...editingStaffPay, allowance: Math.max(0, Number(e.target.value)) })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Potongan Sanksi ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingStaffPay.deduction}
                  onChange={(e) =>
                    setEditingStaffPay({ ...editingStaffPay, deduction: Math.max(0, Number(e.target.value)) })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={editingStaffPay.paymentStatus}
                  onChange={(e) =>
                    setEditingStaffPay({
                      ...editingStaffPay,
                      paymentStatus: e.target.value as 'Paid' | 'Pending' | 'Processing',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white font-medium"
                >
                  <option value="Paid">Paid (Sudah Dibayar)</option>
                  <option value="Processing">Processing (Sedang Diproses)</option>
                  <option value="Pending">Pending (Menunggu Pembayaran)</option>
                </select>
              </div>
            </div>

            {/* Total Take Home Pay Summary */}
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between">
              <span className="text-xs font-bold text-[#7F1D1D]">Total Take Home Pay Bersih:</span>
              <strong className="text-base font-extrabold font-mono text-[#9E1B21]">
                ${(
                  editingStaffPay.baseEarned +
                  editingStaffPay.dutyBonus +
                  editingStaffPay.allowance -
                  editingStaffPay.deduction
                ).toLocaleString()}
              </strong>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingStaffPay(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const total =
                    editingStaffPay.baseEarned +
                    editingStaffPay.dutyBonus +
                    editingStaffPay.allowance -
                    editingStaffPay.deduction;
                  addOrUpdatePayroll(
                    {
                      staffId: editingStaffPay.staffId,
                      staffName: editingStaffPay.staffName,
                      role: editingStaffPay.role,
                      period: 'Minggu Ini (Okt 2026)',
                      basicSalary: editingStaffPay.baseEarned,
                      dutyHours: editingStaffPay.dutyHours,
                      dutyBonus: editingStaffPay.dutyBonus,
                      allowance: editingStaffPay.allowance,
                      deduction: editingStaffPay.deduction,
                      totalSalary: total,
                      paymentStatus: editingStaffPay.paymentStatus,
                      paidAt:
                        editingStaffPay.paymentStatus === 'Paid'
                          ? new Date().toISOString().slice(0, 10)
                          : undefined,
                    },
                    editingStaffPay.existingPayId
                  );
                  setEditingStaffPay(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Simpan Status Slip Gaji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT / PREVIEW SLIP GAJI RESMI */}
      {previewSlip && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white"
          onClick={() => setPreviewSlip(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 p-8 max-w-2xl w-full space-y-6 shadow-2xl relative print:border-none print:shadow-none print:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pratinjau Slip Gaji Resmi
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#85161B] shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setPreviewSlip(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <LogoRSKotaBaru className="w-12 h-12 text-[#9E1B21]" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                      RUMAH SAKIT KOTA BARU
                    </h3>
                    <p className="text-xs font-semibold text-slate-600">
                      DEPARTEMEN SUMBER DAYA MANUSIA & KEUANGAN
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Kotabaru Roleplay Medical Center · Jl. Pelayanan Medis No. 1
                    </p>
                  </div>
                </div>
                <LogoKotaBaruRoleplay className="w-12 h-12 opacity-80" />
              </div>
            </div>

            {/* Title & Slip Metadata */}
            <div className="text-center">
              <h2 className="text-base font-extrabold uppercase tracking-widest text-[#0F1E36]">
                SLIP GAJI TENAGA MEDIS
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Periode Penggajian: {previewSlip.period}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Tenaga Medis</span>
                <strong className="text-slate-900 text-sm">{previewSlip.staffName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Jabatan Resmi</span>
                <strong className="text-[#9E1B21] text-sm">{previewSlip.role}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Jam Duty</span>
                <strong className="text-slate-900 font-mono text-sm">{previewSlip.dutyHours} Jam</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Pembayaran</span>
                <strong className="text-emerald-700 font-mono text-sm">
                  {previewSlip.paymentStatus} {previewSlip.paidAt && `(${previewSlip.paidAt})`}
                </strong>
              </div>
            </div>

            {/* Earnings Breakdown Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0F1E36] text-white text-[11px] font-bold">
                    <th className="py-2.5 px-4">KOMPONEN PENGHASILAN</th>
                    <th className="py-2.5 px-4 text-right">JUMLAH ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">
                      Gaji Pokok (Berdasarkan Jam Kerja & Skema Jabatan {previewSlip.role})
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${previewSlip.basicSalary.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">
                      Bonus Kelebihan Jam Duty ({previewSlip.dutyHours}j)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                      +${previewSlip.dutyBonus.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">Tunjangan Tambahan / Insentif</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                      +${previewSlip.allowance.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">Potongan Administrasi / Disiplin</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                      -${previewSlip.deduction.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-red-50/60 font-extrabold text-sm border-t-2 border-red-200">
                    <td className="py-3 px-4 text-[#9E1B21]">TOTAL TAKE HOME PAY (BERSIH)</td>
                    <td className="py-3 px-4 text-right font-mono text-[#9E1B21] text-base">
                      ${previewSlip.totalSalary.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400">Penerima (Staff Medis)</p>
                <div className="h-14 flex items-end justify-center font-serif italic text-slate-700">
                  {previewSlip.staffName}
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                  {previewSlip.staffName}
                </div>
                <span className="text-[10px] text-slate-400">{previewSlip.role}</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Mengetahui & Menyetujui</p>
                <div className="h-14 flex items-end justify-center font-serif italic text-slate-700">
                  dr. Aurelia Maharani, Sp.BP-RE
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                  Bagian Keuangan & HRD
                </div>
                <span className="text-[10px] text-slate-400">RS Kota Baru Roleplay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. REGULATION MANAGEMENT (Sec 25, 26, 82 — Heads+ Level 7+, ALL images 100% object-contain uncropped)
export const RegulationManagementView: React.FC = () => {
  const { regulations, addOrUpdateRegulation, deleteRegulation, requestDelete } = useApp();
  const [editingReg, setEditingReg] = useState<typeof regulations[0] | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pengobatan & Tarif Utama');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ sizeKb: number; ratio?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [directUrlInput, setDirectUrlInput] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    setCompressionInfo(null);
    try {
      // Compress and optimize image for seamless Cloud Firestore cross-browser sync
      const result = await compressImageForFirestore(file, {
        maxWidth: 1400,
        maxHeight: 1800,
        quality: 0.82,
        targetMaxBytes: 450 * 1024,
      });
      setImageUrl(result.dataUrl);
      setCompressionInfo({
        sizeKb: Math.round(result.byteSize / 1024),
        ratio: result.compressionRatio,
      });
    } catch (err) {
      console.warn('Kompresi canvas fallback ke raw data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-red-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Regulation Management (Heads+)</h2>
          <p className="text-xs text-slate-500">
            Upload atau perbarui poster Regulasi Pengobatan · Sinkronisasi Cloud Firestore real-time ke seluruh browser & akun publik
          </p>
        </div>
        <button
          onClick={() => {
            setEditingReg({
              id: '',
              title: '',
              category: 'Pengobatan & Tarif Utama',
              description: '',
              imageUrl: regulations[0]?.imageUrl || '',
              updatedAt: '',
              updatedBy: '',
            });
            setTitle('');
            setCategory('Pengobatan & Tarif Utama');
            setDescription('');
            setImageUrl(regulations[0]?.imageUrl || '');
            setCompressionInfo(null);
            setImageInputMode('upload');
            setDirectUrlInput('');
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Regulasi Baru</span>
        </button>
      </div>

      {editingReg && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!imageUrl.trim()) {
              return;
            }
            setIsSubmitting(true);
            try {
              const res = await addOrUpdateRegulation(
                { title, category, description, imageUrl },
                editingReg.id || undefined
              );
              if (res.success) {
                setEditingReg(null);
                setCompressionInfo(null);
              }
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="bg-white rounded-2xl border border-red-200 p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-red-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingReg.id ? 'Ganti Poster / Perbarui Regulasi' : 'Upload Regulasi Pengobatan Baru'}
            </h3>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#7F1D1D] border border-red-200">
              Auto-Sync Cloud Firestore
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Regulasi *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Regulasi Tarif Resmi Pengobatan & Tindakan Medis 2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#9E1B21] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <input
                required
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Pengobatan & Tarif Utama"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#9E1B21] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Ringkas *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan ringkasan isi regulasi atau perubahan ketentuan..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#9E1B21] focus:outline-none"
            />
          </div>

          {/* Image Upload / URL Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Poster Regulasi (JPG / PNG / WebP / SVG) *
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    imageInputMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    imageInputMode === 'url'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span>Tautan URL</span>
                  </span>
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <div className="space-y-2">
                <label className="flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-dashed border-red-300 bg-red-50/30 hover:bg-red-50/60 transition text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#9E1B21]" />
                    <span className="font-medium text-slate-700">
                      {isCompressing ? 'Mengompresi & mengoptimasi gambar...' : 'Klik untuk memilih file poster regulasi baru (JPG, PNG, WebP)...'}
                    </span>
                  </div>
                  {isCompressing ? (
                    <Loader2 className="w-4 h-4 text-[#9E1B21] animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#9E1B21]" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isCompressing}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                {compressionInfo && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>
                      Gambar teroptimasi: <strong>{compressionInfo.sizeKb} KB</strong>
                      {compressionInfo.ratio ? ` (${compressionInfo.ratio})` : ''} · Siap sinkron Cloud Firestore real-time.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  placeholder="https://i.imgur.com/... atau https://cdn.discordapp.com/..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#9E1B21] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (directUrlInput.trim()) {
                      setImageUrl(directUrlInput.trim());
                      setCompressionInfo(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Terapkan URL
                </button>
              </div>
            )}
          </div>

          {/* Live Preview of Poster (Uncropped 100% object-contain) */}
          {imageUrl && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-600">
                Preview Poster Regulasi (Ditampilkan Utuh 100% di Halaman Publik):
              </span>
              <div className="w-full max-h-80 overflow-y-auto rounded-xl bg-slate-50 border border-red-100 p-3 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview Regulasi"
                  referrerPolicy="no-referrer"
                  className="max-h-72 w-auto max-w-full object-contain mx-auto block rounded-lg shadow-xs"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting || isCompressing}
              onClick={() => {
                setEditingReg(null);
                setCompressionInfo(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing || !imageUrl}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting
                  ? 'Menyimpan & Menyinkronkan ke Cloud...'
                  : 'Simpan & Terbitkan ke Publik (Real-Time)'}
              </span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {regulations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{reg.title}</h3>
                <p className="text-xs text-slate-500">
                  {reg.category} · Diperbarui {reg.updatedAt} oleh {reg.updatedBy}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={() => {
                    setEditingReg(reg);
                    setTitle(reg.title);
                    setCategory(reg.category);
                    setDescription(reg.description);
                    setImageUrl(reg.imageUrl);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-50/40 border border-red-200 text-xs font-semibold text-[#7F1D1D] hover:bg-red-100 cursor-pointer"
                >
                  Ganti Gambar / Edit Regulasi
                </button>
                <button
                  onClick={() => {
                    requestDelete(
                      'Hapus Regulasi Pengobatan',
                      `Apakah Anda yakin ingin menghapus regulasi "${reg.title}" dari portal?`,
                      () => deleteRegulation(reg.id)
                    );
                  }}
                  title="Hapus Regulasi"
                  className="px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">{reg.description}</p>

            <div className="w-full rounded-xl bg-red-50/40 border border-red-100 p-4 flex items-center justify-center">
              <img
                src={reg.imageUrl}
                alt={reg.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-none object-contain mx-auto block rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
