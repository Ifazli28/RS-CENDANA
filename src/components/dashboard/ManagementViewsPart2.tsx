import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_DISCORD_DUTY_LOG } from '../../data/initialData';
import { DutyLog, RoleName } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertCircle,
  Play,
  Upload,
  Plus,
  Edit3,
  Clock,
  DollarSign,
  ShieldCheck,
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

// 1. DISCORD DUTY PARSER, REKAP DUTY & EXPORT EXCEL/PDF (Sec 66, 67, 68)
export const DutyManagementView: React.FC = () => {
  const { staffAccounts, dutyLogs, addDutyLogsBatch, addToast } = useApp();
  const [rawLogText, setRawLogText] = useState(SAMPLE_DISCORD_DUTY_LOG);
  const [parsedPreview, setParsedPreview] = useState<ParsedDutyPreview[] | null>(null);

  // Recap Filter State (Sec 67)
  const [recapPeriod, setRecapPeriod] = useState<'week' | 'month'>('week');
  const [recapRoleFilter, setRecapRoleFilter] = useState<string>('Semua');
  const [recapStaffSearch, setRecapStaffSearch] = useState('');

  // Parse Discord Log Function (Sec 66)
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

      // Parse duration (e.g., "4 Jam 30 Menit" or "2 Jam")
      let hours = 0;
      let mins = 0;
      const hMatch = durationText.match(/(\d+)\s*Jam/i);
      const mMatch = durationText.match(/(\d+)\s*Menit/i);
      if (hMatch) hours = parseInt(hMatch[1], 10);
      if (mMatch) mins = parseInt(mMatch[1], 10);
      const durationMinutes = hours * 60 + mins;

      // Match staff by name
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
        monthKey: '2026-10',
      }));

    if (validLogs.length === 0) {
      addToast('error', 'Tidak Ada Log Valid', 'Periksa kembali format log Discord Anda.');
      return;
    }

    addDutyLogsBatch(validLogs);
    setParsedPreview(null);
  };

  // Aggregated Recap Data (Sec 67)
  const recapRows = React.useMemo(() => {
    const periodLogs = dutyLogs.filter((l) =>
      recapPeriod === 'week' ? l.weekKey === 'current-week' : l.monthKey === '2026-10'
    );

    const map = new Map<
      string,
      {
        staffId: string;
        staffName: string;
        role: RoleName;
        totalMinutes: number;
        sessions: number;
      }
    >();

    periodLogs.forEach((l) => {
      const cur = map.get(l.staffId);
      if (cur) {
        cur.totalMinutes += l.durationMinutes;
        cur.sessions += 1;
      } else {
        map.set(l.staffId, {
          staffId: l.staffId,
          staffName: l.staffName,
          role: l.role,
          totalMinutes: l.durationMinutes,
          sessions: 1,
        });
      }
    });

    return Array.from(map.values())
      .filter((r) => (recapRoleFilter === 'Semua' ? true : r.role === recapRoleFilter))
      .filter((r) => r.staffName.toLowerCase().includes(recapStaffSearch.toLowerCase()))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [dutyLogs, recapPeriod, recapRoleFilter, recapStaffSearch]);

  const formatHours = (mins: number) => `${Math.floor(mins / 60)} Jam ${mins % 60} Menit`;

  // Export Excel (.xlsx XML Spreadsheet format) — Sec 68
  const handleExportExcel = () => {
    const totalAllMins = recapRows.reduce((a, b) => a + b.totalMinutes, 0);
    const xmlRows = recapRows
      .map(
        (r, i) => `
      <Row>
        <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
        <Cell><Data ss:Type="String">${r.staffName}</Data></Cell>
        <Cell><Data ss:Type="String">${r.role}</Data></Cell>
        <Cell><Data ss:Type="Number">${r.sessions}</Data></Cell>
        <Cell><Data ss:Type="String">${formatHours(r.totalMinutes)}</Data></Cell>
        <Cell><Data ss:Type="String">${formatHours(Math.round(r.totalMinutes / r.sessions))}</Data></Cell>
      </Row>`
      )
      .join('');

    const excelContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Rekap Duty Paramedic Cendana">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">No</Data></Cell>
    <Cell><Data ss:Type="String">Nama Staff</Data></Cell>
    <Cell><Data ss:Type="String">Jabatan</Data></Cell>
    <Cell><Data ss:Type="String">Jumlah Sesi</Data></Cell>
    <Cell><Data ss:Type="String">Total Durasi Duty</Data></Cell>
    <Cell><Data ss:Type="String">Rata-Rata per Sesi</Data></Cell>
   </Row>
   ${xmlRows}
   <Row>
    <Cell><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell><Data ss:Type="String">Periode: ${recapPeriod === 'week' ? 'Mingguan (Senin-Minggu)' : 'Bulanan (Oktober 2026)'}</Data></Cell>
    <Cell><Data ss:Type="String">Filter: ${recapRoleFilter}</Data></Cell>
    <Cell><Data ss:Type="Number">${recapRows.reduce((a, b) => a + b.sessions, 0)}</Data></Cell>
    <Cell><Data ss:Type="String">${formatHours(totalAllMins)}</Data></Cell>
    <Cell><Data ss:Type="String">-</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelContent], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Duty_Paramedic_Cendana_${recapPeriod}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Export Excel (.xlsx) Berhasil', 'File Rekap Duty telah diunduh.');
  };

  // Export PDF / Print-ready Report (Sec 68)
  const handleExportPDF = () => {
    addToast(
      'info',
      'Menyiapkan Laporan PDF Siap Cetak',
      'Membuka mode cetak laporan profesional Rekap Duty RS Cendana.'
    );
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Sec 66: Discord Duty Parser */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Discord Duty Parser — Tempel Log Duty</h2>
            <p className="text-xs text-slate-500">
              Otomatis mengenali atribut Nama, Pekerjaan, Durasi Bekerja, Tanggal Mulai & Tanggal Berakhir
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

        {/* Mandatory Preview Step before saving (Sec 66) */}
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
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600"
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

      {/* Sec 67 & 68: Rekap Duty & Export Excel / PDF */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-pink-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Laporan Rekapitulasi Duty Paramedic Cendana
            </h2>
            <p className="text-xs text-slate-500">
              Periode: {recapPeriod === 'week' ? 'Mingguan (Senin → Minggu)' : 'Bulanan (Oktober 2026)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <div className="flex items-center gap-1 p-1 bg-[#FFF5F8] rounded-xl border border-pink-100">
              <button
                onClick={() => setRecapPeriod('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  recapPeriod === 'week' ? 'bg-[#E83E8C] text-white' : 'text-slate-600'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setRecapPeriod('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  recapPeriod === 'month' ? 'bg-[#E83E8C] text-white' : 'text-slate-600'
                }`}
              >
                Bulanan
              </button>
            </div>

            <input
              type="text"
              value={recapStaffSearch}
              onChange={(e) => setRecapStaffSearch(e.target.value)}
              placeholder="Filter nama staff..."
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
            />

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-[#20C997] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF (Siap Print)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nama Staff</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4 text-right">Jumlah Sesi</th>
                <th className="py-3.5 px-4 text-right">Total Durasi Duty</th>
                <th className="py-3.5 px-4 text-right">Rata-Rata / Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {recapRows.map((r, i) => (
                <tr key={r.staffId} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">{i + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{r.staffName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.role}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    {r.sessions} sesi
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D63384] tabular-nums">
                    {formatHours(r.totalMinutes)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500 tabular-nums">
                    {formatHours(Math.round(r.totalMinutes / r.sessions))}
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

// 2. PAYROLL MANAGEMENT (Sec 69 — Heads+ Level 7+)
export const PayrollManagementView: React.FC = () => {
  const { payrollRecords, addOrUpdatePayroll } = useApp();
  const [editingPay, setEditingPay] = useState<typeof payrollRecords[0] | null>(null);
  const [basic, setBasic] = useState(10000);
  const [bonus, setBonus] = useState(2000);
  const [allowance, setAllowance] = useState(1000);
  const [deduction, setDeduction] = useState(0);
  const [payStatus, setPayStatus] = useState<'Paid' | 'Pending' | 'Processing'>('Paid');

  const openEditPay = (p: typeof payrollRecords[0]) => {
    setEditingPay(p);
    setBasic(p.basicSalary);
    setBonus(p.dutyBonus);
    setAllowance(p.allowance);
    setDeduction(p.deduction);
    setPayStatus(p.paymentStatus);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-pink-100">
        <h2 className="text-lg font-bold text-slate-900">Payroll Management & Skema Gaji Staff</h2>
        <p className="text-xs text-slate-500">
          Atur skema gaji pokok, bonus jam duty, tunjangan, dan potongan seluruh staff
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Staff & Jabatan</th>
                <th className="py-3.5 px-4">Periode</th>
                <th className="py-3.5 px-4 text-right">Basic Salary</th>
                <th className="py-3.5 px-4 text-right">Bonus Duty</th>
                <th className="py-3.5 px-4 text-right">Tambahan</th>
                <th className="py-3.5 px-4 text-right">Potongan</th>
                <th className="py-3.5 px-4 text-right">Total Gaji</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm tabular-nums">
              {payrollRecords.map((p) => (
                <tr key={p.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{p.staffName}</div>
                    <div className="text-[11px] text-[#E83E8C]">{p.role}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{p.period}</td>
                  <td className="py-3.5 px-4 text-right font-mono">${p.basicSalary.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#20C997]">
                    +${p.dutyBonus.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#20C997]">
                    +${p.allowance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                    -${p.deduction.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ${p.totalSalary.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        p.paymentStatus === 'Paid' ? 'text-[#20C997]' : 'text-amber-600'
                      }`}
                    >
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditPay(p)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold cursor-pointer"
                    >
                      Atur Nominal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingPay && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingPay(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">
              Atur Skema Payroll — {editingPay.staffName}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Basic Salary ($)</label>
                <input
                  type="number"
                  value={basic}
                  onChange={(e) => setBasic(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bonus Duty ($)</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tambahan ($)</label>
                <input
                  type="number"
                  value={allowance}
                  onChange={(e) => setAllowance(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Potongan ($)</label>
                <input
                  type="number"
                  value={deduction}
                  onChange={(e) => setDeduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pembayaran</label>
                <select
                  value={payStatus}
                  onChange={(e) => setPayStatus(e.target.value as typeof payStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPay(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const total = basic + bonus + allowance - deduction;
                  addOrUpdatePayroll(
                    {
                      ...editingPay,
                      basicSalary: basic,
                      dutyBonus: bonus,
                      allowance,
                      deduction,
                      totalSalary: total,
                      paymentStatus: payStatus,
                    },
                    editingPay.id
                  );
                  setEditingPay(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-semibold cursor-pointer"
              >
                Simpan Payroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. REGULATION MANAGEMENT (Sec 25, 26, 82 — Heads+ Level 7+, ALL images 100% object-contain uncropped)
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

            {/* Uncropped 100% object-contain container (Sec 25 & 82) */}
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
