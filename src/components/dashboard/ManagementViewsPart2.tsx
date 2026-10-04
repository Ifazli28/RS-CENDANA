import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_DISCORD_DUTY_LOG } from '../../data/initialData';
import { DutyLog, RoleName, RoleSalaryConfig } from '../../types';
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

// 1. DISCORD DUTY PARSER (Sec 66)
export const DutyManagementView: React.FC = () => {
  const { staffAccounts, dutyLogs, addDutyLogsBatch, addToast } = useApp();
  const [rawLogText, setRawLogText] = useState(SAMPLE_DISCORD_DUTY_LOG);
  const [parsedPreview, setParsedPreview] = useState<ParsedDutyPreview[] | null>(null);

  const handleParseDiscordLogs = () => {
    const blocks = rawLogText
      .trim()
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    const results: ParsedDutyPreview[] = blocks.map((block) => {
      const getField = (label: string) => {
        const regex = new RegExp(`${label}\\s*:\\s*(.+)`, 'i');
        const m = block.match(regex);
        return m ? m[1].trim() : '';
      };

      const rawName = getField('Nama');
      const jobTitle = getField('Pekerjaan');
      const durationText = getField('Durasi Bekerja');
      const startDate = getField('Tanggal Mulai');
      const endDate = getField('Tanggal Berakhir');

      let hours = 0;
      let mins = 0;
      const hMatch = durationText.match(/(\d+)\s*Jam/i);
      const mMatch = durationText.match(/(\d+)\s*Menit/i);
      if (hMatch) hours = parseInt(hMatch[1], 10);
      if (mMatch) mins = parseInt(mMatch[1], 10);
      const durationMinutes = hours * 60 + mins;

      const matched = staffAccounts.find(
        (s) =>
          s.name.toLowerCase() === rawName.toLowerCase() ||
          s.name.toLowerCase().includes(rawName.toLowerCase())
      );

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
      .map((p) => ({
        staffId: p.matchedStaffId!,
        staffName: p.matchedStaffName!,
        role: p.matchedRole!,
        jobTitleInLog: p.jobTitle,
        durationMinutes: p.durationMinutes,
        durationFormatted: p.durationText,
        startDate: p.startDate,
        endDate: p.endDate,
        weekKey: 'current-week',
        monthKey: p.startDate.slice(0, 7) || '2026-10',
      }));

    if (validLogs.length === 0) {
      addToast('error', 'Tidak Ada Log Valid', 'Periksa kembali format log Discord Anda.');
      return;
    }

    addDutyLogsBatch(validLogs);
    setParsedPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Discord Duty Parser — Input Log Absensi</h2>
            <p className="text-xs text-slate-500">
              Tempel log duty dari Discord untuk otomatis masuk ke Rekap Absensi Mingguan, Bulanan & Kalkulasi Gaji
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRawLogText(SAMPLE_DISCORD_DUTY_LOG)}
            className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] border border-pink-200 text-xs font-semibold text-[#D63384] cursor-pointer self-start"
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
            className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs focus:border-[#E83E8C] focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleParseDiscordLogs}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Proses & Tampilkan Preview Validasi</span>
          </button>
        </div>

        {parsedPreview && (
          <div className="p-5 rounded-2xl bg-[#FFF5F8] border border-pink-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Hasil Preview & Pencocokan Database Staff (Wajib Konfirmasi Sebelum Simpan)
              </h3>
              <span className="text-xs font-semibold text-slate-600">
                Valid: {parsedPreview.filter((p) => p.isValid).length} · Gagal:{' '}
                {parsedPreview.filter((p) => !p.isValid).length}
              </span>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-pink-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-pink-100 bg-slate-50 text-slate-500">
                    <th className="py-2.5 px-3">Nama di Log</th>
                    <th className="py-2.5 px-3">Pekerjaan</th>
                    <th className="py-2.5 px-3">Durasi</th>
                    <th className="py-2.5 px-3">Mulai — Berakhir</th>
                    <th className="py-2.5 px-3">Status Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {parsedPreview.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.rawName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.jobTitle}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#D63384]">
                        {item.durationText} ({item.durationMinutes} mnt)
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {item.startDate} → {item.endDate}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.isValid ? (
                          <span className="text-[#20C997] font-bold">
                            ✓ Cocok ({item.matchedRole})
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">
                            ✗ Gagal: {item.errorReason}
                          </span>
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
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
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
                <th className="py-3 px-4 text-right rounded-tr-xl text-[#FBBF24]">DURASI SESI</th>
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
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {log.durationFormatted}
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
          const logDatePrefix = l.startDate.slice(0, 10);
          const exactDayIdx = weekDays.findIndex((wd) => wd.fullDate === logDatePrefix);
          if (exactDayIdx !== -1) {
            dayMinutes[exactDayIdx] += l.durationMinutes;
          } else if (l.weekKey === 'current-week' && weekStartStr === '2026-10-05') {
            // Fallback day-of-week mapping for current-week logs
            const parsed = new Date(l.startDate.replace(' ', 'T'));
            if (!isNaN(parsed.getTime())) {
              const jsDay = parsed.getDay(); // 0=Sun, 1=Mon...
              const monBasedIdx = jsDay === 0 ? 6 : jsDay - 1;
              dayMinutes[monBasedIdx] += l.durationMinutes;
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
      <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Rekap Absensi Mingguan Tenaga Medis
          </h2>
          <p className="text-xs text-slate-500">
            Rekapitulasi jam duty harian (Senin s/d Minggu) beserta status pencapaian target jam mingguan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#FFF5F8] px-3 py-1.5 rounded-xl border border-pink-100">
            <span className="text-[11px] font-bold text-slate-600">Mulai Senin:</span>
            <input
              type="date"
              value={weekStartStr}
              onChange={(e) => setWeekStartStr(e.target.value)}
              className="text-xs font-mono font-bold text-[#D63384] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama tenaga medis..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
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
          .filter((l) => l.staffId === st.id && l.monthKey === selectedMonth)
          .forEach((l) => {
            sessionsCount += 1;
            const dayNum = parseInt(l.startDate.slice(8, 10), 10);
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
      <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Rekap Absensi Bulanan Tenaga Medis
          </h2>
          <p className="text-xs text-slate-500">
            Akumulasi jam duty mingguan (Minggu 1 s/d Minggu 5) dalam periode satu bulan penuh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#FFF5F8] px-3 py-1.5 rounded-xl border border-pink-100">
            <span className="text-[11px] font-bold text-slate-600">Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-mono font-bold text-[#D63384] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama tenaga medis..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
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

// 4. PAYROLL MANAGEMENT & SKEMA GAJI BERDASARKAN JABATAN (Sec 69 — Heads+ Level 7+)
export const PayrollManagementView: React.FC = () => {
  const {
    staffAccounts,
    dutyLogs,
    payrollRecords,
    roleSalaryConfigs,
    updateRoleSalaryConfig,
    addOrUpdatePayroll,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'role-config' | 'weekly-payroll'>('role-config');
  const [editingRoleConfig, setEditingRoleConfig] = useState<RoleSalaryConfig | null>(null);

  // State for editing individual staff payroll override/payment status
  const [editingStaffPay, setEditingStaffPay] = useState<{
    staffId: string;
    staffName: string;
    role: RoleName;
    existingPayId?: string;
    dutyHours: number;
    baseEarned: number;
    dutyBonus: number;
    allowance: number;
    deduction: number;
    paymentStatus: 'Paid' | 'Pending' | 'Processing';
  } | null>(null);

  // Compute live weekly payroll rows for all active staff based on their role config & weekly duty logs
  const calculatedStaffPayrollRows = React.useMemo(() => {
    const activeStaff = staffAccounts
      .filter((s) => s.status === 'Active')
      .sort((a, b) => b.level - a.level);

    return activeStaff.map((st) => {
      const weeklyMins = dutyLogs
        .filter((l) => l.staffId === st.id && l.weekKey === 'current-week')
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

  const handleSyncAllCalculatedToPayroll = () => {
    calculatedStaffPayrollRows.forEach((row) => {
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
      'Seluruh slip gaji staff telah diperbarui berdasarkan jam duty mingguan & skema jabatan.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Tab Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Sistem Gaji Berdasarkan Jabatan & Kalkulasi Target Duty Mingguan
          </h2>
          <p className="text-xs text-slate-500">
            Memenuhi target jam mingguan = <strong>Gaji Utuh</strong> · Tidak memenuhi ={' '}
            <strong>Dihitung Per Jam</strong> · Melebihi target ={' '}
            <strong>Bonus per Kelipatan Jam</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#FFF5F8] rounded-xl border border-pink-100 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('role-config')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'role-config'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#D63384]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Atur Skema Gaji Jabatan</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly-payroll')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'weekly-payroll'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#D63384]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Kalkulasi & Slip Gaji Staff</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENGATURAN SKEMA GAJI PER JABATAN */}
      {activeTab === 'role-config' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFF5F8]/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tabel Pengaturan Gaji Utuh, Gaji Per Jam, Target Duty Mingguan & Bonus Kelipatan Jam
              </h3>
              <p className="text-xs text-slate-500">
                Klik tombol <strong>Atur Skema</strong> pada jabatan untuk mengubah target jam per minggu, gaji utuh, tarif per jam, atau kelipatan jam bonus.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F1E36] text-white text-[11px] font-extrabold tracking-wider uppercase">
                  <th className="py-3.5 px-4 text-center w-12">LV</th>
                  <th className="py-3.5 px-4">JABATAN (ROLE)</th>
                  <th className="py-3.5 px-4 text-center">TARGET DUTY / MINGGU</th>
                  <th className="py-3.5 px-4 text-right">GAJI UTUH (CAPAI TARGET)</th>
                  <th className="py-3.5 px-4 text-right">GAJI PER JAM (KURANG TARGET)</th>
                  <th className="py-3.5 px-4 text-center">KELIPATAN JAM BONUS</th>
                  <th className="py-3.5 px-4 text-right text-[#FBBF24]">NOMINAL BONUS / KELIPATAN</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm tabular-nums">
                {[...roleSalaryConfigs]
                  .sort((a, b) => b.level - a.level)
                  .map((cfg) => (
                    <tr key={cfg.role} className="hover:bg-pink-50/30 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {cfg.level}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cfg.role}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs">
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
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D63384]">
                        +${cfg.bonusPerStepAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditingRoleConfig({ ...cfg })}
                          className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] border border-pink-200 text-xs font-bold cursor-pointer"
                        >
                          Atur Skema
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KALKULASI GAJI STAFF BERDASARKAN JAM DUTY MINGGUAN */}
      {activeTab === 'weekly-payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF5F8]/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kalkulasi Otomatis Gaji & Bonus Mingguan Seluruh Staff Aktif
              </h3>
              <p className="text-xs text-slate-500">
                Dihitung otomatis dari total jam duty minggu berjalan dibandingkan dengan target jam mingguan jabatan masing-masing
              </p>
            </div>
            <button
              onClick={handleSyncAllCalculatedToPayroll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer self-start sm:self-auto"
            >
              Terbitkan / Update Semua Slip Gaji ke Database
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F1E36] text-white text-[11px] font-extrabold tracking-wider uppercase">
                  <th className="py-3.5 px-4">NAMA TENAGA MEDIS & JABATAN</th>
                  <th className="py-3.5 px-4 text-center">JAM DUTY / TARGET</th>
                  <th className="py-3.5 px-4 text-center">SKEMA GAJI POKOK</th>
                  <th className="py-3.5 px-4 text-right">GAJI POKOK DITERIMA</th>
                  <th className="py-3.5 px-4 text-right">BONUS LEBIH JAM</th>
                  <th className="py-3.5 px-4 text-right">TUNJANGAN / POTONGAN</th>
                  <th className="py-3.5 px-4 text-right text-[#FBBF24]">TOTAL TAKE HOME PAY</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm tabular-nums">
                {calculatedStaffPayrollRows.map((row) => (
                  <tr key={row.staff.id} className="hover:bg-pink-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.staff.name}</div>
                      <div className="text-[11px] text-[#E83E8C] font-semibold">
                        {row.staff.role}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-extrabold text-slate-900">{row.calc.dutyHours}j</span>
                      <span className="text-slate-400"> / {row.calc.targetHours}j</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.calc.meetsTarget ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Gaji Utuh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Per Jam (${row.roleCfg?.hourlyRate}/j)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${row.calc.baseEarned.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="font-bold text-[#20C997]">
                        +${row.calc.dutyBonus.toLocaleString()}
                      </div>
                      {row.calc.bonusMultiples > 0 && (
                        <div className="text-[10px] text-slate-400">
                          +{row.calc.excessHours}j ({row.calc.bonusMultiples}x kelipatan)
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
                        className={`text-xs font-bold ${
                          row.paymentStatus === 'Paid' ? 'text-[#20C997]' : 'text-amber-600'
                        }`}
                      >
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          setEditingStaffPay({
                            staffId: row.staff.id,
                            staffName: row.staff.name,
                            role: row.staff.role,
                            existingPayId: row.savedPay?.id,
                            dutyHours: row.calc.dutyHours,
                            baseEarned: row.calc.baseEarned,
                            dutyBonus: row.calc.dutyBonus,
                            allowance: row.allowance,
                            deduction: row.deduction,
                            paymentStatus: row.paymentStatus,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold cursor-pointer"
                      >
                        Detail / Bayar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-lg w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-pink-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E83E8C]">
                LEVEL {editingRoleConfig.level} · PENGATURAN SKEMA GAJI JABATAN
              </span>
              <h3 className="text-lg font-bold text-slate-900">{editingRoleConfig.role}</h3>
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
                  Jika jam duty mingguan mencapai nilai ini, staff mendapat <strong>Gaji Utuh</strong>. Jika kurang, dihitung <strong>Gaji Per Jam</strong>.
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-bold cursor-pointer"
              >
                Simpan Skema Jabatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL / PEMBAYARAN SLIP GAJI INDIVIDU */}
      {editingStaffPay && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingStaffPay(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Slip Gaji Mingguan — {editingStaffPay.staffName}
            </h3>
            <p className="text-xs text-slate-500">
              Jabatan: <strong>{editingStaffPay.role}</strong> · Jam Duty Minggu Ini:{' '}
              <strong>{editingStaffPay.dutyHours} Jam</strong>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gaji Pokok Terhitung ($)
                </label>
                <input
                  type="number"
                  value={editingStaffPay.baseEarned}
                  onChange={(e) =>
                    setEditingStaffPay({ ...editingStaffPay, baseEarned: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bonus Lebih Jam ($)
                </label>
                <input
                  type="number"
                  value={editingStaffPay.dutyBonus}
                  onChange={(e) =>
                    setEditingStaffPay({ ...editingStaffPay, dutyBonus: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tunjangan Tambahan ($)
                </label>
                <input
                  type="number"
                  value={editingStaffPay.allowance}
                  onChange={(e) =>
                    setEditingStaffPay({ ...editingStaffPay, allowance: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Potongan ($)
                </label>
                <input
                  type="number"
                  value={editingStaffPay.deduction}
                  onChange={(e) =>
                    setEditingStaffPay({ ...editingStaffPay, deduction: Number(e.target.value) })
                  }
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Paid">Paid (Sudah Dibayar)</option>
                  <option value="Processing">Processing (Diproses)</option>
                  <option value="Pending">Pending (Menunggu)</option>
                </select>
              </div>
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
                className="px-5 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-bold cursor-pointer"
              >
                Simpan Slip Gaji
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. REGULATION MANAGEMENT (Sec 25, 26, 82 — Heads+ Level 7+, ALL images 100% object-contain uncropped)
export const RegulationManagementView: React.FC = () => {
  const { regulations, addOrUpdateRegulation } = useApp();
  const [editingReg, setEditingReg] = useState<typeof regulations[0] | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pengobatan & Tarif Utama');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Regulation Management (Heads+)</h2>
          <p className="text-xs text-slate-500">
            Upload atau perbarui gambar Regulasi Pengobatan · Seluruh gambar ditampilkan utuh 100% (object-contain)
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
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Regulasi Baru</span>
        </button>
      </div>

      {editingReg && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addOrUpdateRegulation(
              { title, category, description, imageUrl },
              editingReg.id || undefined
            );
            setEditingReg(null);
          }}
          className="bg-white rounded-2xl border border-pink-200 p-6 space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900">
            {editingReg.id ? 'Ganti Gambar / Perbarui Regulasi' : 'Upload Regulasi Pengobatan Baru'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Regulasi *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <input
                required
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload / Ganti Gambar Poster Regulasi (JPG / PNG / WebP)
            </label>
            <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] text-xs cursor-pointer">
              <span>Klik untuk memilih file gambar regulasi baru...</span>
              <Upload className="w-4 h-4 text-[#E83E8C]" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingReg(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-semibold cursor-pointer"
            >
              Simpan & Terbitkan ke Publik
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {regulations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">{reg.title}</h3>
                <p className="text-xs text-slate-500">
                  {reg.category} · Diperbarui {reg.updatedAt} oleh {reg.updatedBy}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingReg(reg);
                  setTitle(reg.title);
                  setCategory(reg.category);
                  setDescription(reg.description);
                  setImageUrl(reg.imageUrl);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FFF5F8] border border-pink-200 text-xs font-semibold text-[#D63384] hover:bg-pink-100 cursor-pointer self-start"
              >
                Ganti Gambar / Edit Regulasi
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">{reg.description}</p>

            <div className="w-full rounded-xl bg-[#FFF5F8] border border-pink-100 p-4 flex items-center justify-center">
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
