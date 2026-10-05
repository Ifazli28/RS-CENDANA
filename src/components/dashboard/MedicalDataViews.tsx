import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Brain,
  Eye,
  Calendar,
  Stethoscope,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

// 1. DATA SURAT KETERANGAN SEHAT (Sec 59 — Paramedic+ Level 3+)
export const SKSResultsView: React.FC = () => {
  const { sksRecords, updateSKSStatus } = useApp();
  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('Semua');
  const [selectedRecord, setSelectedRecord] = useState<typeof sksRecords[0] | null>(null);

  const filtered = sksRecords.filter((r) => {
    const matchSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.occupation.toLowerCase().includes(search.toLowerCase());
    const matchPurpose = purposeFilter === 'Semua' || r.purpose === purposeFilter;
    return matchSearch && matchPurpose;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Data Surat Keterangan Sehat (SKS)</h2>
          <p className="text-xs text-slate-500">
            Akses Khusus Paramedic ke atas (Level 3+) · Verifikasi & Penerbitan SKS Warga
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / pekerjaan..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
            />
          </div>
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="Semua">Semua Keperluan</option>
            <option value="Pemeriksaan Rutin">Pemeriksaan Rutin</option>
            <option value="Lampiran Pembuatan Lisensi">Lampiran Pembuatan Lisensi</option>
            <option value="Lampiran Melamar Pekerjaan">Lampiran Melamar Pekerjaan</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Umur</th>
                <th className="py-3.5 px-4">Pekerjaan</th>
                <th className="py-3.5 px-4">Keperluan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Detail / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data Surat Keterangan Sehat yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-pink-50/30 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{r.fullName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {r.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.gender}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">{r.age} th</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.occupation}</td>
                    <td className="py-3.5 px-4 text-slate-700">{r.purpose}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold ${
                          r.status === 'Issued' || r.status === 'Verified'
                            ? 'text-[#20C997]'
                            : 'text-amber-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Detail Surat Keterangan Sehat</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Nama Pasien:</strong> {selectedRecord.fullName}</p>
              <p><strong>Tanggal Lahir:</strong> {selectedRecord.birthDate} ({selectedRecord.age} tahun)</p>
              <p><strong>Gender:</strong> {selectedRecord.gender}</p>
              <p><strong>Pekerjaan:</strong> {selectedRecord.occupation}</p>
              <p><strong>No HP / IC:</strong> {selectedRecord.phoneOrIC}</p>
              <p><strong>Keperluan:</strong> {selectedRecord.purpose}</p>
              <p><strong>Status Saat Ini:</strong> {selectedRecord.status}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  updateSKSStatus(selectedRecord.id, 'Verified');
                  setSelectedRecord(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#20C997] text-white text-xs font-semibold cursor-pointer"
              >
                Verifikasi (Verified)
              </button>
              <button
                onClick={() => {
                  updateSKSStatus(selectedRecord.id, 'Issued');
                  setSelectedRecord(null);
                }}
                className="flex-1 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-semibold cursor-pointer"
              >
                Terbitkan (Issued)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. DATA TES PSIKOLOGI (Sec 60 — Co-ass+ Level 4+)
export const PsychologyResultsView: React.FC = () => {
  const { psychologyRecords, updatePsychologyStatus } = useApp();
  const [search, setSearch] = useState('');
  const [selectedPsy, setSelectedPsy] = useState<typeof psychologyRecords[0] | null>(null);

  const filtered = psychologyRecords.filter(
    (r) =>
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Data Hasil & Evaluasi Tes Psikologi</h2>
          <p className="text-xs text-slate-500">
            Data Privat Kesehatan Mental · Hanya dapat diakses oleh Co-ass ke atas (Level 4+)
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / tujuan..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Peserta</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Tujuan Evaluasi</th>
                <th className="py-3.5 px-4">Pekerjaan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{r.fullName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    {r.createdAt}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{r.purpose}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.occupation}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-bold text-[#20C997]">{r.status}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedPsy(r)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold cursor-pointer"
                    >
                      Buka Detail Privat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPsy && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPsy(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-lg w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Rekam Psikologis — {selectedPsy.fullName}</h3>
              <button onClick={() => setSelectedPsy(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Tanggal Lahir & Umur:</strong> {selectedPsy.birthDate} ({selectedPsy.age} th)</p>
              <p><strong>Gender:</strong> {selectedPsy.gender}</p>
              <p><strong>Pekerjaan:</strong> {selectedPsy.occupation}</p>
              <p><strong>No HP / IC:</strong> {selectedPsy.phoneOrIC}</p>
              <p><strong>Tujuan:</strong> {selectedPsy.purpose}</p>
              <div className="p-3.5 rounded-xl bg-[#FFF5F8] border border-pink-100 mt-2">
                <p className="font-bold text-[#D63384] mb-1">Keluhan / Riwayat Psikologis Singkat:</p>
                <p>{selectedPsy.historyNotes || 'Tidak ada catatan tambahan.'}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  updatePsychologyStatus(selectedPsy.id, 'Completed');
                  setSelectedPsy(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#20C997] text-white text-xs font-semibold cursor-pointer"
              >
                Tandai Selesai (Completed)
              </button>
              <button
                onClick={() => setSelectedPsy(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. HASIL TES BUTA WARNA (Sec 24 & 61 — Doctor+ Level 5+)
export const ColorBlindResultsView: React.FC = () => {
  const { colorBlindResults } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCB, setSelectedCB] = useState<typeof colorBlindResults[0] | null>(null);

  const filtered = colorBlindResults.filter(
    (r) =>
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hasil Tes Buta Warna (20 Lempeng Ishihara)</h2>
          <p className="text-xs text-slate-500">
            Akses Khusus Doctor ke atas (Level 5+) · Evaluasi Diagnostik Penglihatan Warna
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / kategori..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Peserta</th>
                <th className="py-3.5 px-4">Tanggal Tes</th>
                <th className="py-3.5 px-4 text-right">Hasil Skor</th>
                <th className="py-3.5 px-4 text-right">Jawaban Benar</th>
                <th className="py-3.5 px-4 text-right">Jawaban Salah</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{r.fullName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    {r.testDate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {r.scorePercentage}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#20C997] font-bold tabular-nums">
                    {r.correctCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-rose-600 font-bold tabular-nums">
                    {r.wrongCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        r.category === 'Normal' ? 'text-[#20C997]' : 'text-[#E83E8C]'
                      }`}
                    >
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCB(r)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold cursor-pointer"
                    >
                      Detail Jawaban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCB && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedCB(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Detail Tes Ishihara — {selectedCB.fullName}
              </h3>
              <button onClick={() => setSelectedCB(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <p><strong>Tanggal Tes:</strong> {selectedCB.testDate}</p>
              <p><strong>Kategori Diagnosis:</strong> {selectedCB.category} ({selectedCB.scorePercentage}%)</p>
              <p><strong>Benar / Salah:</strong> {selectedCB.correctCount} Benar · {selectedCB.wrongCount} Salah</p>
            </div>
            <div className="border-t border-pink-100 pt-3 space-y-1.5">
              <p className="text-xs font-bold text-slate-700">Rincian Lempeng:</p>
              {selectedCB.answersDetail.map((ans) => (
                <div
                  key={ans.plateNumber}
                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-50 font-mono tabular-nums"
                >
                  <span>Plate #{ans.plateNumber} ({ans.type})</span>
                  <span>
                    Jawab: <strong>{ans.userAnswer}</strong> (Kunci: {ans.expected}){' '}
                    {ans.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. DATA JANJI TEMU (Sec 62 — Doctor+ Level 5+)
export const AppointmentsDataView: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Data Janji Temu Pasien</h2>
          <p className="text-xs text-slate-500">
            Akses Khusus Doctor ke atas (Level 5+) · Kelola Status Kunjungan Pasien
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasien / dokter..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Pasien</th>
                <th className="py-3.5 px-4">Dokter Tujuan</th>
                <th className="py-3.5 px-4">Spesialisasi</th>
                <th className="py-3.5 px-4">Tanggal & Jam</th>
                <th className="py-3.5 px-4">Keluhan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-pink-50/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{a.patientName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{a.patientPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{a.doctorName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{a.specialty}</td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums">
                    {a.date} · {a.time}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                    {a.complaint}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        a.status === 'Confirmed' || a.status === 'Completed'
                          ? 'text-[#20C997]'
                          : a.status === 'Cancelled'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={a.status}
                      onChange={(e) =>
                        updateAppointmentStatus(a.id, e.target.value as typeof a.status)
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-pink-200 text-xs bg-white font-semibold text-slate-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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

// 5. JADWAL PRAKTIK DOKTER MANAGEMENT (Sec 63 — Doctor+ Level 5+)
export const DoctorScheduleManageView: React.FC = () => {
  const { doctorSchedules, staffAccounts, currentUser, addDoctorSchedule, deleteDoctorSchedule } =
    useApp();

  const doctorsList = staffAccounts.filter((s) => s.status === 'Active' && s.level >= 5);
  const [selectedDocId, setSelectedDocId] = useState(currentUser?.id || doctorsList[0]?.id || '');
  const [specialty, setSpecialty] = useState('Doctor');
  const [days, setDays] = useState('Senin, Rabu, Jumat');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:00');
  const [status, setStatus] = useState<'Available' | 'Full' | 'Off Duty'>('Available');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-pink-100 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Buat Jadwal Praktik Dokter</h2>
          <p className="text-xs text-slate-500">
            Jadwal yang disimpan otomatis terhubung dan muncul pada Halaman Publik
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const doc = staffAccounts.find((s) => s.id === selectedDocId);
            if (!doc) return;
            addDoctorSchedule({
              doctorId: doc.id,
              doctorName: doc.name,
              doctorRole: doc.role,
              doctorAvatar: doc.avatarUrl,
              specialty,
              days,
              startTime,
              endTime,
              status,
            });
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Dokter *</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {doctorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori / Spesialisasi *
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="Doctor">Doctor (Poli Umum)</option>
              <option value="Specialist Doctor">Specialist Doctor</option>
              <option value="Spesialis Bedah">Spesialis Bedah</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hari Praktik *</label>
            <input
              required
              type="text"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Contoh: Senin - Jumat"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai *</label>
            <input
              required
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai *</label>
            <input
              required
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="Available">Available</option>
              <option value="Full">Full</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Tampilkan di Halaman Publik</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctorSchedules.map((sch) => (
          <div
            key={sch.id}
            className="p-5 rounded-2xl bg-white border border-pink-100 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={sch.doctorAvatar}
                alt={sch.doctorName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-pink-200"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{sch.doctorName}</h3>
                <p className="text-xs text-[#E83E8C] font-semibold">
                  {sch.specialty} · {sch.days} ({sch.startTime}–{sch.endTime})
                </p>
                <p className="text-[11px] text-[#20C997] font-semibold">Status: {sch.status}</p>
              </div>
            </div>
            <button
              onClick={() => deleteDoctorSchedule(sch.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Hapus Jadwal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. DATA PENGAJUAN OPERASI PLASTIK (Doctor+ Level 5+ — Dapat menyetujui & mencantumkan nama dokter yang menangani)
export const PlasticSurgeryDataView: React.FC = () => {
  const { plasticSurgeryRecords, staffAccounts, currentUser, updatePlasticSurgeryStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [selectedRecord, setSelectedRecord] = useState<typeof plasticSurgeryRecords[0] | null>(null);
  const [handlingDoctor, setHandlingDoctor] = useState('');

  const activeDoctors = staffAccounts.filter((s) => s.status === 'Active' && s.level >= 5);

  const openModal = (rec: typeof plasticSurgeryRecords[0]) => {
    setSelectedRecord(rec);
    setHandlingDoctor(rec.handlingDoctorName || currentUser?.name || activeDoctors[0]?.name || '');
  };

  const filtered = plasticSurgeryRecords.filter((r) => {
    const matchSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.surgeryType.toLowerCase().includes(search.toLowerCase()) ||
      (r.handlingDoctorName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Data Pengajuan Prosedur Operasi Plastik
          </h2>
          <p className="text-xs text-slate-500">
            Akses Khusus Doctor ke atas (Level 5+) · Verifikasi Dokumen SKB/SKWB & Persetujuan Dokter Penanggung Jawab
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasien / prosedur / dokter..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100 text-[11px] font-bold text-slate-500 bg-[#FFF5F8]/60">
                <th className="py-3.5 px-4">Nama Pasien</th>
                <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                <th className="py-3.5 px-4">Prosedur Operasi Plastik</th>
                <th className="py-3.5 px-4">Dokumen KTP, Kartu Pasien & SKB/SKWB</th>
                <th className="py-3.5 px-4">Dokter yang Menangani</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-xs sm:text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data pengajuan operasi plastik yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-pink-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{r.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.gender} · {r.age} th · {r.phoneOrIC}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                      {r.createdAt}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{r.surgeryType}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 space-y-0.5">
                      <div className="truncate max-w-[190px]" title={r.idPhotoName}>
                        <span className="font-semibold text-slate-700">KTP:</span> {r.idPhotoName}
                      </div>
                      <div className="truncate max-w-[190px]" title={r.patientCardPhotoName || '-'}>
                        <span className="font-semibold text-emerald-700">Kartu Pasien:</span>{' '}
                        {r.patientCardPhotoName || '-'}
                      </div>
                      <div className="truncate max-w-[190px]" title={r.legalDocName}>
                        <span className="font-semibold text-[#D63384]">SKB/SKWB:</span> {r.legalDocName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.handlingDoctorName ? (
                        <div>
                          <span className="font-semibold text-slate-900">{r.handlingDoctorName}</span>
                          {r.approvedAt && (
                            <div className="text-[10px] font-mono text-slate-400">{r.approvedAt}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Belum ditentukan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold ${
                          r.status === 'Approved' || r.status === 'Completed'
                            ? 'text-[#20C997]'
                            : r.status === 'Rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openModal(r)}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold cursor-pointer"
                      >
                        Proses / Setujui
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-lg w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Verifikasi & Persetujuan Operasi Plastik
                  </h3>
                  <p className="text-[11px] text-slate-500">Pasien: {selectedRecord.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 bg-[#FFF5F8]/60 p-4 rounded-xl border border-pink-100">
              <p>
                <strong>Nama Pasien:</strong> {selectedRecord.fullName}
              </p>
              <p>
                <strong>Tanggal Lahir:</strong> {selectedRecord.birthDate} ({selectedRecord.age} th)
              </p>
              <p>
                <strong>Gender:</strong> {selectedRecord.gender}
              </p>
              <p>
                <strong>Pekerjaan:</strong> {selectedRecord.occupation}
              </p>
              <p>
                <strong>No HP / IC:</strong> {selectedRecord.phoneOrIC}
              </p>
              <p>
                <strong>Status Saat Ini:</strong> {selectedRecord.status}
              </p>
              <p className="col-span-2">
                <strong>Prosedur Operasi:</strong> {selectedRecord.surgeryType}
              </p>
              <p className="col-span-2">
                <strong>Lampiran KTP:</strong> {selectedRecord.idPhotoName}
              </p>
              <p className="col-span-2">
                <strong>Foto Kartu Pasien:</strong> {selectedRecord.patientCardPhotoName || '-'}
              </p>
              <p className="col-span-2">
                <strong>Dokumen SKB (Kepolisian) / SKWB:</strong> {selectedRecord.legalDocName}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Nama Dokter yang Menangani *
              </label>
              <input
                type="text"
                required
                value={handlingDoctor}
                onChange={(e) => setHandlingDoctor(e.target.value)}
                placeholder="Masukkan atau pilih nama dokter yang menangani..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#E83E8C] focus:outline-none"
              />
              {activeDoctors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Pilih Cepat:</span>
                  {activeDoctors.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setHandlingDoctor(doc.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                        handlingDoctor === doc.name
                          ? 'bg-[#E83E8C] text-white border-[#E83E8C]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pink-300'
                      }`}
                    >
                      {doc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-pink-100">
              <button
                type="button"
                onClick={() => {
                  updatePlasticSurgeryStatus(
                    selectedRecord.id,
                    'Rejected',
                    handlingDoctor || currentUser?.name || '-'
                  );
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
              >
                Tolak (Reject)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!handlingDoctor.trim()) return;
                  updatePlasticSurgeryStatus(selectedRecord.id, 'Completed', handlingDoctor);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tandai Selesai (Completed)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!handlingDoctor.trim()) return;
                  updatePlasticSurgeryStatus(selectedRecord.id, 'Approved', handlingDoctor);
                  setSelectedRecord(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#20C997] hover:opacity-95 text-white text-xs font-bold cursor-pointer"
              >
                Setujui Operasi Plastik (Approve)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

