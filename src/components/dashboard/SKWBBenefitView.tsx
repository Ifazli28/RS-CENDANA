import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SKWBClaim, ROLE_LEVELS } from '../../types';
import {
  ShieldCheck,
  Search,
  Calendar,
  Eye,
  Package,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  X,
  ArrowLeft,
  FileImage,
} from 'lucide-react';

// Helper untuk mengecek apakah masa berlaku SKWB (Tanggal Terbit + 7 hari) masih aktif secara otomatis
function isSKWBClaimCurrentlyActive(issueDateStr: string, endDateStr: string): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  if (endDateStr) {
    return todayStr <= endDateStr;
  }
  const parts = issueDateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + 7);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return todayStr <= `${yyyy}-${mm}-${dd}`;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

export const SKWBBenefitView: React.FC = () => {
  const {
    currentUser,
    staffAccounts,
    skwbClaims,
    skwbPaketSedangClaims,
    skwbPatientCardClaims,
    skwbOplasClaims,
    claimSKWBPaketSedang,
    claimSKWBPatientCard,
    claimSKWBOplas,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Kadaluarsa'>('Semua');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [previewPhotoClaim, setPreviewPhotoClaim] = useState<SKWBClaim | null>(null);

  // Modal state untuk Klaim 3 Benefit
  const [activeClaimModal, setActiveClaimModal] = useState<
    null | 'paket_sedang' | 'kartu_pasien' | 'oplas'
  >(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [claimErrorMsg, setClaimErrorMsg] = useState('');

  // RBAC Guard Berlapis: Hanya Paramedic ke atas (Level >= 3)
  if (!currentUser || currentUser.level < ROLE_LEVELS['Paramedic']) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center max-w-lg mx-auto my-8 space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Unauthorized / Anda tidak memiliki akses ke halaman ini.
        </h2>
        <p className="text-xs text-slate-500">
          Menu Benefit SKWB hanya dapat diakses oleh anggota staff dengan jabatan minimal{' '}
          <strong>Paramedic ke atas</strong>.
        </p>
      </div>
    );
  }

  const todayStr = getTodayDateString();

  // Hitung status aktif/kadaluarsa secara real-time berdasarkan Tanggal Terbit SKWB + 7 hari
  const enrichedClaims = useMemo(() => {
    return skwbClaims.map((claim) => {
      const isActive = isSKWBClaimCurrentlyActive(claim.issueDate, claim.endDate);
      const computedStatus: 'Aktif' | 'Kadaluarsa' = isActive ? 'Aktif' : 'Kadaluarsa';
      const paketHistory = skwbPaketSedangClaims
        .filter((p) => p.skwbClaimId === claim.id)
        .sort((a, b) => `${b.claimDate} ${b.claimTime}`.localeCompare(`${a.claimDate} ${a.claimTime}`));
      const claimedPaketToday = paketHistory.some((p) => p.claimDate === todayStr);
      const patientCardRecord = skwbPatientCardClaims.find((k) => k.skwbClaimId === claim.id) || null;
      const oplasRecord = skwbOplasClaims.find((o) => o.skwbClaimId === claim.id) || null;

      return {
        ...claim,
        computedStatus,
        isActive,
        paketHistory,
        claimedPaketToday,
        patientCardRecord,
        oplasRecord,
      };
    });
  }, [skwbClaims, skwbPaketSedangClaims, skwbPatientCardClaims, skwbOplasClaims, todayStr]);

  const filteredClaims = useMemo(() => {
    return enrichedClaims.filter((c) => {
      const matchesSearch =
        c.icName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.birthDate.includes(searchQuery) ||
        c.issueDate.includes(searchQuery);
      const matchesStatus = statusFilter === 'Semua' || c.computedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedClaims, searchQuery, statusFilter]);

  const selectedClaim = useMemo(
    () => enrichedClaims.find((c) => c.id === selectedClaimId) || null,
    [enrichedClaims, selectedClaimId]
  );

  // Daftar Staff Aktif sesuai syarat Role masing-masing Benefit
  // Benefit 1 (Paket Sedang): Role >= Co-ass (Level >= 4)
  // Benefit 2 (Kartu Pasien): Role >= Paramedic (Level >= 3)
  // Benefit 3 (Free 1x Oplas): Role >= Doctor (Level >= 5)
  const eligibleStaffList = useMemo(() => {
    let minLevel = 4;
    if (activeClaimModal === 'paket_sedang') minLevel = ROLE_LEVELS['Co-ass']; // 4
    if (activeClaimModal === 'kartu_pasien') minLevel = ROLE_LEVELS['Paramedic']; // 3
    if (activeClaimModal === 'oplas') minLevel = ROLE_LEVELS['Doctor']; // 5

    return staffAccounts
      .filter(
        (s) =>
          s.status === 'Active' &&
          s.level >= minLevel &&
          (s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
            s.role.toLowerCase().includes(staffSearchQuery.toLowerCase()))
      )
      .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
  }, [staffAccounts, activeClaimModal, staffSearchQuery]);

  const chosenStaffObj = useMemo(
    () => staffAccounts.find((s) => s.id === selectedStaffId && s.status === 'Active') || null,
    [staffAccounts, selectedStaffId]
  );

  const openClaimModal = (type: 'paket_sedang' | 'kartu_pasien' | 'oplas') => {
    setClaimErrorMsg('');
    setStaffSearchQuery('');
    setSelectedStaffId('');
    setActiveClaimModal(type);
  };

  const handleConfirmBenefitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !activeClaimModal) return;
    setClaimErrorMsg('');

    if (!selectedStaffId) {
      setClaimErrorMsg('Staff yang menangani wajib dipilih.');
      return;
    }

    let result: { success: boolean; message: string } = {
      success: false,
      message: 'Terjadi kesalahan.',
    };

    if (activeClaimModal === 'paket_sedang') {
      result = claimSKWBPaketSedang(selectedClaim.id, selectedStaffId);
    } else if (activeClaimModal === 'kartu_pasien') {
      result = claimSKWBPatientCard(selectedClaim.id, selectedStaffId);
    } else if (activeClaimModal === 'oplas') {
      result = claimSKWBOplas(selectedClaim.id, selectedStaffId);
    }

    if (!result.success) {
      setClaimErrorMsg(result.message);
      return;
    }

    setActiveClaimModal(null);
    setSelectedStaffId('');
    setStaffSearchQuery('');
  };

  // TAMPILAN DETAIL BENEFIT SKWB
  if (selectedClaim) {
    return (
      <div className="space-y-6">
        {/* Tombol Kembali & Header Detail */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedClaimId(null)}
              className="p-2.5 rounded-xl border border-pink-200 bg-[#FFF5F8] text-[#D63384] hover:bg-pink-100 transition cursor-pointer"
              title="Kembali ke Daftar Benefit SKWB"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">
                  Detail Benefit SKWB — {selectedClaim.icName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    selectedClaim.computedStatus === 'Aktif'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {selectedClaim.computedStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Masa Berlaku Otomatis (7 Hari):{' '}
                <strong className="font-mono text-slate-800">
                  {selectedClaim.startDate} s/d {selectedClaim.endDate}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setPreviewPhotoClaim(selectedClaim)}
            className="px-4 py-2.5 rounded-xl border border-pink-200 bg-[#FFF5F8] text-[#D63384] hover:bg-pink-100 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Foto Surat SKWB</span>
          </button>
        </div>

        {/* Bagian 1 & 2: Informasi Warga & Informasi SKWB */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Warga & SKWB */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Informasi Warga */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#E83E8C] border-b border-pink-100 pb-2">
                  Informasi Warga
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Nama IC</span>
                    <span className="font-bold text-slate-900">{selectedClaim.icName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tanggal Lahir</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedClaim.birthDate}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Waktu Pengajuan</span>
                    <span className="font-mono text-slate-600">{selectedClaim.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Informasi SKWB */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#20C997] border-b border-pink-100 pb-2">
                  Informasi SKWB
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tanggal Terbit SKWB</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {selectedClaim.issueDate}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tanggal Mulai Benefit</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedClaim.startDate}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tanggal Berakhir Benefit</span>
                    <span className="font-mono font-bold text-[#D63384]">
                      {selectedClaim.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500">Status Benefit</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        selectedClaim.computedStatus === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {selectedClaim.computedStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!selectedClaim.isActive && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs font-semibold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Masa berlaku SKWB warga ini telah berakhir ({selectedClaim.endDate}). Seluruh klaim benefit baru dinonaktifkan secara otomatis.
                </span>
              </div>
            )}
          </div>

          {/* Foto SKWB Card */}
          <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Foto Surat SKWB
              </h2>
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px]">
                {selectedClaim.photoFileName}
              </span>
            </div>
            <div
              onClick={() => setPreviewPhotoClaim(selectedClaim)}
              className="relative group rounded-xl overflow-hidden border border-pink-100 bg-slate-50 h-44 flex items-center justify-center cursor-pointer"
            >
              {selectedClaim.photoDataUrl ? (
                <img
                  src={selectedClaim.photoDataUrl}
                  alt={`SKWB ${selectedClaim.icName}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="text-xs text-slate-400 flex flex-col items-center gap-1">
                  <FileImage className="w-6 h-6" />
                  <span>Tidak ada gambar</span>
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                <Eye className="w-4 h-4" /> Perbesar Foto SKWB
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Ukuran: {(selectedClaim.photoFileSize / 1024).toFixed(1)} KB · Klik gambar untuk memperbesar
            </p>
          </div>
        </div>

        {/* DAFTAR 3 BENEFIT SKWB */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Daftar Benefit SKWB</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* BENEFIT 1: PAKET SEDANG (Obat dan Perban - Harian 1x/hari, Co-ass+) */}
            <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      selectedClaim.claimedPaketToday
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedClaim.isActive
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedClaim.claimedPaketToday
                      ? 'Sudah Diklaim Hari Ini'
                      : selectedClaim.isActive
                      ? 'Tersedia Hari Ini'
                      : 'Masa Berlaku Berakhir'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">1. Paket Sedang</h3>
                  <p className="text-xs font-semibold text-[#D63384] mt-0.5">Isi: Obat dan Perban</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Dapat diklaim <strong>1 kali setiap hari</strong> selama masa berlaku SKWB masih aktif. Wajib ditangani oleh <strong>Co-ass ke atas</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF5F8] border border-pink-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pengambilan:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedClaim.paketHistory.length} Kali
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Hari Ini ({todayStr}):</span>
                    <span className="font-semibold text-slate-800">
                      {selectedClaim.claimedPaketToday ? 'Claimed' : 'Belum Diklaim'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {selectedClaim.isActive ? (
                  <button
                    onClick={() => openClaimModal('paket_sedang')}
                    disabled={selectedClaim.claimedPaketToday}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedClaim.claimedPaketToday
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white shadow-xs hover:opacity-95'
                    }`}
                  >
                    {selectedClaim.claimedPaketToday
                      ? 'Paket Sedang Sudah Diklaim Hari Ini'
                      : 'Klaim Paket Sedang'}
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                    Masa Berlaku SKWB Telah Berakhir
                  </div>
                )}
              </div>
            </div>

            {/* BENEFIT 2: DISKON 50% PEMBUATAN KARTU PASIEN (1x selama SKWB, Paramedic+) */}
            <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#20C997] flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      selectedClaim.patientCardRecord
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedClaim.isActive
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedClaim.patientCardRecord
                      ? 'Claimed'
                      : selectedClaim.isActive
                      ? 'Belum Diklaim'
                      : 'Kadaluarsa'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    2. Diskon 50% Pembuatan Kartu Pasien
                  </h3>
                  <p className="text-xs font-semibold text-[#20C997] mt-0.5">
                    Potongan 50% Biaya Administrasi Kartu Pasien
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Hanya dapat diklaim <strong>1 kali</strong> selama masa berlaku SKWB. Wajib ditangani oleh <strong>Paramedic ke atas</strong>.
                  </p>
                </div>

                {selectedClaim.patientCardRecord ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
                      <span>Status: Claimed</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Tanggal Klaim:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedClaim.patientCardRecord.claimDate} ({selectedClaim.patientCardRecord.claimTime})
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Staff Pembuat Kartu:</span>
                      <span className="font-bold text-slate-900">
                        {selectedClaim.patientCardRecord.staffName}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Jabatan Staff:</span>
                      <span className="font-semibold text-[#D63384]">
                        {selectedClaim.patientCardRecord.staffRole}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FFF5F8] border border-pink-100 text-xs text-slate-600">
                    Belum pernah diklaim. Kuota tersedia: <strong>1x Klaim</strong>.
                  </div>
                )}
              </div>

              <div className="pt-2">
                {selectedClaim.patientCardRecord ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold cursor-not-allowed"
                  >
                    Sudah Diklaim (Claimed)
                  </button>
                ) : selectedClaim.isActive ? (
                  <button
                    onClick={() => openClaimModal('kartu_pasien')}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer"
                  >
                    Klaim Diskon 50% Kartu Pasien
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                    Masa Berlaku SKWB Telah Berakhir
                  </div>
                )}
              </div>
            </div>

            {/* BENEFIT 3: FREE 1x OPLAS (1x selama SKWB, Doctor+) */}
            <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      selectedClaim.oplasRecord
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedClaim.isActive
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedClaim.oplasRecord
                      ? 'Claimed'
                      : selectedClaim.isActive
                      ? 'Belum Diklaim'
                      : 'Kadaluarsa'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">3. Free 1x Oplas</h3>
                  <p className="text-xs font-semibold text-[#D63384] mt-0.5">
                    Gratis 1x Prosedur Operasi Plastik Warga Baru
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Hanya dapat diklaim <strong>1 kali</strong> selama masa berlaku SKWB. Wajib ditangani oleh <strong>Doctor ke atas</strong>.
                  </p>
                </div>

                {selectedClaim.oplasRecord ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
                      <span>Status: Claimed</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Tanggal Klaim:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedClaim.oplasRecord.claimDate} ({selectedClaim.oplasRecord.claimTime})
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Dokter yang Menangani:</span>
                      <span className="font-bold text-slate-900">
                        {selectedClaim.oplasRecord.staffName}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Jabatan Dokter:</span>
                      <span className="font-semibold text-[#D63384]">
                        {selectedClaim.oplasRecord.staffRole}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FFF5F8] border border-pink-100 text-xs text-slate-600">
                    Belum pernah diklaim. Kuota tersedia: <strong>1x Klaim</strong>.
                  </div>
                )}
              </div>

              <div className="pt-2">
                {selectedClaim.oplasRecord ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold cursor-not-allowed"
                  >
                    Sudah Diklaim (Claimed)
                  </button>
                ) : selectedClaim.isActive ? (
                  <button
                    onClick={() => openClaimModal('oplas')}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer"
                  >
                    Klaim Free 1x Oplas
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
                    Masa Berlaku SKWB Telah Berakhir
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIWAYAT KLAIM PAKET SEDANG (Sec 15: Record Terpisah per Pengambilan) */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Riwayat Klaim Paket Sedang (Obat & Perban)
              </h2>
              <p className="text-xs text-slate-500">
                Setiap pengambilan harian disimpan sebagai histori transaksi terpisah beserta snapshot nama & jabatan staff.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#FFF5F8] border border-pink-200 text-xs font-mono font-bold text-[#D63384] self-start sm:self-auto">
              Total Klaim: {selectedClaim.paketHistory.length} Record
            </span>
          </div>

          {selectedClaim.paketHistory.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#FFF5F8] border border-pink-100 text-center text-xs text-slate-500">
              Belum ada riwayat pengambilan Paket Sedang untuk warga ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-pink-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Tanggal Klaim</th>
                    <th className="py-3 px-4">Waktu Klaim</th>
                    <th className="py-3 px-4">Nama Staff yang Menangani</th>
                    <th className="py-3 px-4">Jabatan Staff</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50 text-xs">
                  {selectedClaim.paketHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-pink-50/40">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {item.claimDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.claimTime}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.staffName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-pink-50 text-[#D63384] font-semibold">
                          {item.staffRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL PILIH STAFF & KONFIRMASI KLAIM BENEFIT */}
        {activeClaimModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveClaimModal(null);
            }}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl border border-pink-100 shadow-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeClaimModal === 'paket_sedang' && 'Klaim Paket Sedang (Obat & Perban)'}
                    {activeClaimModal === 'kartu_pasien' &&
                      'Klaim Diskon 50% Pembuatan Kartu Pasien'}
                    {activeClaimModal === 'oplas' && 'Klaim Free 1x Operasi Plastik (Oplas)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Warga IC: <strong>{selectedClaim.icName}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setActiveClaimModal(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {claimErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {claimErrorMsg}
                </div>
              )}

              <form onSubmit={handleConfirmBenefitClaim} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#FFF5F8] border border-pink-100 text-xs text-slate-700">
                  {activeClaimModal === 'paket_sedang' && (
                    <span>
                      Syarat Kewenangan: Hanya menampilkan anggota staff aktif dengan jabatan{' '}
                      <strong className="text-[#D63384]">Co-ass ke atas</strong>.
                    </span>
                  )}
                  {activeClaimModal === 'kartu_pasien' && (
                    <span>
                      Syarat Kewenangan: Hanya menampilkan anggota staff aktif dengan jabatan{' '}
                      <strong className="text-[#D63384]">Paramedic ke atas</strong>.
                    </span>
                  )}
                  {activeClaimModal === 'oplas' && (
                    <span>
                      Syarat Kewenangan: Hanya menampilkan anggota staff aktif dengan jabatan{' '}
                      <strong className="text-[#D63384]">Doctor ke atas</strong>.
                    </span>
                  )}
                </div>

                {/* Search & Dropdown Staff */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {activeClaimModal === 'paket_sedang' && 'Pilih Staff yang Menangani *'}
                    {activeClaimModal === 'kartu_pasien' && 'Pilih Staff yang Membuatkan Kartu *'}
                    {activeClaimModal === 'oplas' && 'Pilih Dokter yang Menangani *'}
                  </label>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      placeholder="Cari nama staff atau jabatan..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-xs"
                    />
                  </div>

                  <select
                    required
                    value={selectedStaffId}
                    onChange={(e) => {
                      setSelectedStaffId(e.target.value);
                      setClaimErrorMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-xs bg-white font-medium"
                  >
                    <option value="">-- Pilih Nama Anggota Staff --</option>
                    {eligibleStaffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} — ({st.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview Staff yang Dipilih */}
                {chosenStaffObj && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={chosenStaffObj.avatarUrl}
                        alt={chosenStaffObj.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Nama Staff: {chosenStaffObj.name}
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700">
                          Jabatan: {chosenStaffObj.role} (Lv.{chosenStaffObj.level})
                        </p>
                      </div>
                    </div>
                    <UserCheck className="w-5 h-5 text-[#20C997] shrink-0" />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2.5 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setActiveClaimModal(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-xs hover:opacity-95 cursor-pointer"
                  >
                    Konfirmasi Klaim
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PREVIEW FOTO SKWB */}
        {previewPhotoClaim && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4"
            onClick={() => setPreviewPhotoClaim(null)}
          >
            <div
              className="max-w-3xl w-full bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Foto Surat Keterangan Warga Baru (SKWB) — {previewPhotoClaim.icName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Terbit: {previewPhotoClaim.issueDate} · Berlaku s/d {previewPhotoClaim.endDate}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewPhotoClaim(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-[75vh]">
                <img
                  src={previewPhotoClaim.photoDataUrl}
                  alt={`SKWB ${previewPhotoClaim.icName}`}
                  className="max-h-[72vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TAMPILAN DAFTAR BENEFIT SKWB UTAMA
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Benefit SKWB (Warga Baru)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manajemen klaim Paket Sedang harian, Diskon 50% Kartu Pasien, dan Free 1x Oplas selama 7 hari masa berlaku SKWB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-[#FFF5F8] border border-pink-100">
            <span className="text-slate-500">Total SKWB: </span>
            <strong className="font-mono text-slate-900">{enrichedClaims.length}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70">
            <span className="text-emerald-700">Aktif: </span>
            <strong className="font-mono text-emerald-800">
              {enrichedClaims.filter((c) => c.computedStatus === 'Aktif').length}
            </strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200/70">
            <span className="text-rose-700">Kadaluarsa: </span>
            <strong className="font-mono text-rose-800">
              {enrichedClaims.filter((c) => c.computedStatus === 'Kadaluarsa').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-pink-100 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan Nama IC, Tanggal Lahir, atau Tanggal Terbit SKWB..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#FFF5F8] rounded-xl border border-pink-100 self-start sm:self-auto">
          {(['Semua', 'Aktif', 'Kadaluarsa'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#E83E8C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#D63384]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Daftar Warga yang Mengajukan Benefit SKWB */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-pink-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Data Pengajuan SKWB</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Data warga baru yang mengajukan klaim melalui card <strong>Klaim Benefit SKWB</strong> di Portal Umum akan otomatis tampil secara real-time di halaman ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF5F8] border-b border-pink-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Nama IC</th>
                  <th className="py-3.5 px-4">Tgl Lahir</th>
                  <th className="py-3.5 px-4">Tgl Terbit SKWB</th>
                  <th className="py-3.5 px-4">Masa Berlaku (Mulai – Akhir)</th>
                  <th className="py-3.5 px-4">Status Benefit</th>
                  <th className="py-3.5 px-4">Foto SKWB</th>
                  <th className="py-3.5 px-4">Status Masing-Masing Benefit</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-xs">
                {filteredClaims.map((item) => (
                  <tr key={item.id} className="hover:bg-pink-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.icName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.birthDate}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {item.issueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#E83E8C]" />
                        {item.startDate} s/d <strong>{item.endDate}</strong>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          item.computedStatus === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.computedStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setPreviewPhotoClaim(item)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-pink-200 bg-[#FFF5F8] text-[#D63384] hover:bg-pink-100 font-semibold text-[11px] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Foto</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {/* Status Paket Sedang */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.claimedPaketToday
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Paket Sedang: {item.paketHistory.length}x ({item.claimedPaketToday ? 'Hari Ini ✓' : 'Hari Ini Belum'})
                        </span>
                        {/* Status Diskon 50% Kartu Pasien */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.patientCardRecord
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          Kartu Pasien: {item.patientCardRecord ? 'Claimed' : 'Belum'}
                        </span>
                        {/* Status Free 1x Oplas */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.oplasRecord
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-pink-50 text-[#D63384]'
                          }`}
                        >
                          Free Oplas: {item.oplasRecord ? 'Claimed' : 'Belum'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedClaimId(item.id)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-2xs hover:opacity-95 cursor-pointer whitespace-nowrap"
                      >
                        Kelola & Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview Foto SKWB dari Tabel */}
      {previewPhotoClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4"
          onClick={() => setPreviewPhotoClaim(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-2xl border border-pink-100 p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Foto Surat Keterangan Warga Baru (SKWB) — {previewPhotoClaim.icName}
                </h3>
                <p className="text-xs text-slate-500">
                  Terbit: {previewPhotoClaim.issueDate} · Berlaku s/d {previewPhotoClaim.endDate}
                </p>
              </div>
              <button
                onClick={() => setPreviewPhotoClaim(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-[75vh]">
              <img
                src={previewPhotoClaim.photoDataUrl}
                alt={`SKWB ${previewPhotoClaim.icName}`}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
