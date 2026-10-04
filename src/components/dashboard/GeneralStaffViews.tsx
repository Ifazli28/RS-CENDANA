import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  FileText,
  Vote,
  DollarSign,
  Umbrella,
  UserMinus,
  BookOpen,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
} from 'lucide-react';

// 1. DASHBOARD HOME & LEADERBOARD DUTY (Sec 38 & 39)
export const DashboardLeaderboardView: React.FC = () => {
  const { dutyLogs, staffAccounts, currentUser } = useApp();
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month'>('week');

  // Filter logs from unified Discord Duty Parser / Duty Log source
  const filteredLogs = dutyLogs.filter((log) =>
    periodFilter === 'week' ? log.weekKey === 'current-week' : log.monthKey === '2026-10'
  );

  // Aggregate total duty hours & session count per staff
  const leaderboardData = React.useMemo(() => {
    const map = new Map<
      string,
      {
        staffId: string;
        name: string;
        role: string;
        avatarUrl: string;
        totalMinutes: number;
        sessions: number;
      }
    >();

    // Seed with active staff so everyone appears or gets matched
    staffAccounts
      .filter((s) => s.status === 'Active')
      .forEach((s) => {
        map.set(s.id, {
          staffId: s.id,
          name: s.name,
          role: s.role,
          avatarUrl: s.avatarUrl,
          totalMinutes: 0,
          sessions: 0,
        });
      });

    filteredLogs.forEach((log) => {
      const existing = map.get(log.staffId);
      if (existing) {
        existing.totalMinutes += log.durationMinutes;
        existing.sessions += 1;
      } else {
        map.set(log.staffId, {
          staffId: log.staffId,
          name: log.staffName,
          role: log.role,
          avatarUrl: staffAccounts.find((a) => a.id === log.staffId)?.avatarUrl || '',
          totalMinutes: log.durationMinutes,
          sessions: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [filteredLogs, staffAccounts]);

  const formatHoursMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}j ${m}m`;
  };

  const topThree = leaderboardData.slice(0, 3);
  const restRanking = leaderboardData.slice(3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#E83E8C]">
            PORTAL INTERNAL STAFF · LEVEL {currentUser?.level} ({currentUser?.role})
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
            Selamat Bertugas, {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau jam duty aktif, pengumuman medis, serta layanan sesuai hak akses jabatan Anda.
          </p>
        </div>

        {/* Period Filter (Sec 38: Default Minggu berjalan Senin-Minggu, Filter Minggu / Bulan) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF5F8] rounded-xl border border-pink-100 self-start sm:self-auto">
          <button
            onClick={() => setPeriodFilter('week')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              periodFilter === 'week'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#D63384]'
            }`}
          >
            Minggu Berjalan (Sen–Min)
          </button>
          <button
            onClick={() => setPeriodFilter('month')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              periodFilter === 'month'
                ? 'bg-[#E83E8C] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#D63384]'
            }`}
          >
            Bulan Ini (Okt 2026)
          </button>
        </div>
      </div>

      {/* Leaderboard Podium Top 1-3 (Sec 39: #1, #2, #3 lebih menonjol, modern medical premium) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#E83E8C]" />
            <h3 className="text-lg font-bold text-slate-900">
              Leaderboard Jam Duty Paramedic Cendana
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sumber: Discord Duty Parser Terintegrasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topThree.map((item, idx) => {
            const rank = idx + 1;
            const isFirst = rank === 1;
            return (
              <div
                key={item.staffId}
                className={`p-6 rounded-2xl border transition relative overflow-hidden ${
                  isFirst
                    ? 'bg-gradient-to-br from-[#FFF5F8] via-white to-pink-50/70 border-[#E83E8C] shadow-md'
                    : 'bg-white border-pink-100 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-2xl font-extrabold font-mono tabular-nums ${
                      isFirst
                        ? 'text-[#E83E8C]'
                        : rank === 2
                        ? 'text-[#20C997]'
                        : 'text-amber-600'
                    }`}
                  >
                    #{rank}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {item.sessions} Sesi Duty
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className={`${
                      isFirst ? 'w-16 h-16' : 'w-14 h-14'
                    } rounded-2xl object-cover border-2 border-pink-200 shrink-0`}
                  />
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{item.role}</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#D63384] tabular-nums">
                        {formatHoursMinutes(item.totalMinutes)}
                      </span>
                      <span className="text-[11px] text-slate-400">total durasi</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ranking #4+ Compact Table (Sec 39) */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-pink-100 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Peringkat #4 dan Seterusnya
            </h4>
            <span className="text-xs text-slate-400 tabular-nums">
              Total {leaderboardData.length} Staff Aktif
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-50 text-[11px] font-semibold text-slate-500 bg-[#FFF5F8]/60">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Staff Medis</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4 text-right">Jumlah Sesi</th>
                  <th className="py-3 px-4 text-right">Total Jam Duty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-sm">
                {restRanking.map((item, idx) => (
                  <tr key={item.staffId} className="hover:bg-pink-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 tabular-nums">
                      #{idx + 4}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{item.role}</td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {item.sessions} sesi
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#D63384] tabular-nums">
                      {formatHoursMinutes(item.totalMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. PROFIL STAFF, GANTI PASSWORD & PENGATURAN EMAIL (Sec 40, 41, 42)
export const StaffProfileView: React.FC = () => {
  const { currentUser, updateProfileAvatar, changePassword, changeEmail, addToast } = useApp();

  // Password Change State (Sec 41)
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');

  // Email Settings State (Sec 42)
  const [emailPass, setEmailPass] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confEmail, setConfEmail] = useState('');

  if (!currentUser) return null;

  const hasUpper = /[A-Z]/.test(newPass);
  const hasLower = /[a-z]/.test(newPass);
  const hasNumber = /[0-9]/.test(newPass);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPass);
  const passValid = hasUpper && hasLower && hasNumber && hasSymbol && newPass === confPass;

  const handleJpgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().match(/\.(jpg|jpeg)$/)) {
      addToast('error', 'Format Harus JPG', 'Silakan pilih file foto berformat .JPG atau .JPEG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfileAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Sec 40: Profil Staff */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          referrerPolicy="no-referrer"
          className="w-24 h-24 rounded-2xl object-cover border-2 border-[#E83E8C]"
        />
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
          <p className="text-sm font-semibold text-[#E83E8C]">
            {currentUser.role} (Level {currentUser.level})
          </p>
          <p className="text-xs text-slate-500">
            {currentUser.email} · Bergabung {currentUser.joinDate}
          </p>
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF5F8] border border-pink-200 text-xs font-semibold text-[#D63384] hover:bg-pink-100 cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Upload Foto Profil Baru (.JPG) — Live Preview</span>
              <input type="file" accept=".jpg,.jpeg" className="hidden" onChange={handleJpgUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sec 41: Ganti Password */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-pink-100 pb-3">
            Ganti Password
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!passValid) return;
              const res = changePassword(curPass, newPass);
              if (res.success) {
                setCurPass('');
                setNewPass('');
                setConfPass('');
              }
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password Saat Ini *
              </label>
              <input
                required
                type="password"
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password Baru *
              </label>
              <input
                required
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Password Baru *
              </label>
              <input
                required
                type="password"
                value={confPass}
                onChange={(e) => setConfPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="p-3 rounded-xl bg-[#FFF5F8] text-[11px] text-slate-600 space-y-1">
              <div className={hasUpper ? 'text-[#20C997] font-semibold' : ''}>
                • Minimal 1 huruf besar (Uppercase)
              </div>
              <div className={hasLower ? 'text-[#20C997] font-semibold' : ''}>
                • Minimal 1 huruf kecil (Lowercase)
              </div>
              <div className={hasNumber ? 'text-[#20C997] font-semibold' : ''}>
                • Minimal 1 angka (Number)
              </div>
              <div className={hasSymbol ? 'text-[#20C997] font-semibold' : ''}>
                • Minimal 1 simbol (!@#$%^&*)
              </div>
            </div>
            <button
              type="submit"
              disabled={!passValid}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
            >
              Simpan Password Baru
            </button>
          </form>
        </div>

        {/* Sec 42: Pengaturan Email */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-pink-100 pb-3">
            Pengaturan Email
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newEmail !== confEmail) {
                addToast('error', 'Konfirmasi Tidak Sama', 'Email baru dan konfirmasi email harus sama.');
                return;
              }
              const res = changeEmail(emailPass, newEmail);
              if (res.success) {
                setEmailPass('');
                setNewEmail('');
                setConfEmail('');
              }
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Saat Ini
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password Saat Ini *
              </label>
              <input
                required
                type="password"
                value={emailPass}
                onChange={(e) => setEmailPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Baru *
              </label>
              <input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Email Baru *
              </label>
              <input
                required
                type="email"
                value={confEmail}
                onChange={(e) => setConfEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold cursor-pointer"
            >
              Perbarui Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// 3. ANGGOTA STAFF (Sec 43 — Urutkan jabatan tertinggi → terendah, jangan tampilkan data sensitif)
export const StaffDirectoryView: React.FC = () => {
  const { staffAccounts } = useApp();
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<typeof staffAccounts[0] | null>(null);

  const activeSorted = staffAccounts
    .filter((s) => s.status === 'Active')
    .sort((a, b) => b.level - a.level)
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Direktori Anggota Staff Aktif</h2>
          <p className="text-xs text-slate-500">
            Diurutkan berdasarkan hirarki jabatan tertinggi (Level 10) ke terendah (Level 1)
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau jabatan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#E83E8C] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeSorted.map((st) => (
          <div
            key={st.id}
            className="p-5 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={st.avatarUrl}
                alt={st.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-pink-200 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{st.name}</h3>
                <p className="text-xs font-semibold text-[#E83E8C]">
                  {st.role} · Level {st.level}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {st.specialty || 'Tenaga Medis RS Cendana'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStaff(st)}
              className="w-full py-2 px-3 rounded-xl bg-[#FFF5F8] hover:bg-pink-100 text-[#D63384] text-xs font-semibold transition cursor-pointer"
            >
              Profil Selengkapnya
            </button>
          </div>
        ))}
      </div>

      {selectedStaff && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedStaff(null)}
        >
          <div
            className="bg-white rounded-2xl border border-pink-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <img
                src={selectedStaff.avatarUrl}
                alt={selectedStaff.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-pink-200"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStaff.name}</h3>
                <p className="text-xs font-semibold text-[#E83E8C]">
                  {selectedStaff.role} (Level {selectedStaff.level})
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-2 border-t border-pink-100 pt-3">
              <p>
                <strong>Bidang / Spesialisasi:</strong> {selectedStaff.specialty || '-'}
              </p>
              <p>
                <strong>Tanggal Bergabung:</strong> {selectedStaff.joinDate}
              </p>
              <p>
                <strong>Tentang Staff:</strong>{' '}
                {selectedStaff.bio || 'Anggota resmi unit pelayanan medis Rumah Sakit Cendana.'}
              </p>
            </div>
            <button
              onClick={() => setSelectedStaff(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. VOTING INTERNAL (Sec 51 — Semua staff aktif memilih 1x, Heads+ dapat membuat voting)
export const VotingView: React.FC = () => {
  const { votingPolls, currentUser, castVote, createVotingPoll } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [optionsText, setOptionsText] = useState('Opsi 1\nOpsi 2');

  if (!currentUser) return null;
  const canCreate = currentUser.level >= 7;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Voting & Jajak Pendapat Internal</h2>
          <p className="text-xs text-slate-500">
            Satu staff hanya dapat memberikan 1 suara pada setiap pemungutan suara
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Voting Baru (Heads+)</span>
          </button>
        )}
      </div>

      {showCreate && canCreate && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const opts = optionsText
              .split('\n')
              .map((o) => o.trim())
              .filter(Boolean);
            if (opts.length < 2) return;
            createVotingPoll(title, desc, deadline, opts);
            setTitle('');
            setDesc('');
            setShowCreate(false);
          }}
          className="bg-white p-6 rounded-2xl border border-pink-200 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900">Buat Voting Internal Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Voting *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline *</label>
              <input
                required
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi *</label>
            <input
              required
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilihan Suara (Satu opsi per baris, minimal 2) *
            </label>
            <textarea
              required
              rows={3}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-semibold cursor-pointer"
            >
              Terbitkan Voting
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {votingPolls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, o) => acc + o.votes.length, 0);
          const myVoteOption = poll.options.find((o) => o.votes.includes(currentUser.id));

          return (
            <div key={poll.id} className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{poll.title}</h3>
                  <p className="text-xs text-slate-500">
                    Dibuat oleh {poll.createdBy} · Batas Waktu: {poll.deadline} · Status:{' '}
                    <strong className="text-[#20C997]">{poll.status}</strong>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                  Total {totalVotes} Suara
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">{poll.description}</p>

              <div className="space-y-2.5">
                {poll.options.map((opt) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                  const isSelected = myVoteOption?.id === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isSelected ? 'border-[#E83E8C] bg-[#FFF5F8]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {opt.label} {isSelected && ' (Pilihan Anda)'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                            {opt.votes.length} suara ({pct}%)
                          </span>
                          {!myVoteOption && poll.status === 'Open' && (
                            <button
                              onClick={() => castVote(poll.id, opt.id)}
                              className="px-3 py-1 rounded-lg bg-[#E83E8C] text-white text-xs font-semibold hover:opacity-95 cursor-pointer"
                            >
                              Pilih
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#E83E8C] to-[#20C997]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. GAJI SAYA (Sec 52)
export const MySalaryView: React.FC = () => {
  const { payrollRecords, currentUser } = useApp();
  if (!currentUser) return null;

  const myPayrolls = payrollRecords.filter((p) => p.staffId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-pink-100">
        <h2 className="text-lg font-bold text-slate-900">Gaji Saya & Riwayat Pembayaran</h2>
        <p className="text-xs text-slate-500">
          Rincian slip gaji pribadi berdasarkan jabatan ({currentUser.role}) dan jam duty aktif
        </p>
      </div>

      {myPayrolls.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-pink-100 text-center text-sm text-slate-500">
          Belum ada catatan slip gaji untuk akun Anda pada periode ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myPayrolls.map((pay) => (
            <div
              key={pay.id}
              className="bg-white rounded-2xl border border-pink-100 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#E83E8C]">SLIP GAJI RESMI RS CENDANA</span>
                  <h3 className="text-xl font-bold text-slate-900">Periode: {pay.period}</h3>
                  <p className="text-xs text-slate-500">
                    {pay.staffName} · Jabatan: {pay.role}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500">Status Pembayaran:</span>
                  <div className="text-sm font-bold text-[#20C997]">
                    {pay.paymentStatus} {pay.paidAt && `(${pay.paidAt})`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm tabular-nums">
                <div className="p-3.5 rounded-xl bg-[#FFF5F8]">
                  <p className="text-xs text-slate-500">Basic Salary</p>
                  <p className="text-base font-bold font-mono text-slate-900">
                    ${pay.basicSalary.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FFF5F8]">
                  <p className="text-xs text-slate-500">Bonus Duty ({pay.dutyHours}j)</p>
                  <p className="text-base font-bold font-mono text-[#20C997]">
                    +${pay.dutyBonus.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FFF5F8]">
                  <p className="text-xs text-slate-500">Tunjangan Tambahan</p>
                  <p className="text-base font-bold font-mono text-[#20C997]">
                    +${pay.allowance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FFF5F8]">
                  <p className="text-xs text-slate-500">Potongan</p>
                  <p className="text-base font-bold font-mono text-rose-600">
                    -${pay.deduction.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white">
                  <p className="text-xs text-pink-100">Take Home Pay</p>
                  <p className="text-lg font-extrabold font-mono">
                    ${pay.totalSalary.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 6. PENGAJUAN CUTI & PENGAJUAN RESIGN (Sec 53 & 55)
export const LeaveAndResignView: React.FC<{ mode: 'leave' | 'resign' }> = ({ mode }) => {
  const { currentUser, leaveRequests, resignRequests, submitLeaveRequest, submitResignRequest } =
    useApp();

  const [leaveType, setLeaveType] = useState<
    'Cuti Tahunan' | 'Cuti Sakit' | 'Cuti Darurat / Keluarga' | 'Izin Khusus'
  >('Cuti Tahunan');
  const [startDate, setStartDate] = useState('2026-10-10');
  const [endDate, setEndDate] = useState('2026-10-12');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Resign State
  const [effectiveDate, setEffectiveDate] = useState('2026-10-31');
  const [resignReason, setResignReason] = useState('');
  const [resignDetails, setResignDetails] = useState('');

  if (!currentUser) return null;

  if (mode === 'leave') {
    const myLeaves = leaveRequests.filter((l) => l.staffId === currentUser.id);
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-pink-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Formulir Pengajuan Cuti Staff</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const d1 = new Date(startDate);
              const d2 = new Date(endDate);
              const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
              submitLeaveRequest({
                leaveType,
                startDate,
                endDate,
                durationDays: diff,
                reason,
                attachmentName: attachmentName || undefined,
              });
              setReason('');
              setAttachmentName('');
            }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Cuti *</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as typeof leaveType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Cuti Tahunan">Cuti Tahunan</option>
                <option value="Cuti Sakit">Cuti Sakit</option>
                <option value="Cuti Darurat / Keluarga">Cuti Darurat / Keluarga</option>
                <option value="Izin Khusus">Izin Khusus</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Cuti *</label>
              <input
                required
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan alasan pengajuan cuti..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lampiran (Opsional)</label>
              <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-200 bg-[#FFF5F8] text-xs cursor-pointer">
                <span className="truncate">{attachmentName || 'Pilih file...'}</span>
                <Upload className="w-4 h-4 text-[#E83E8C]" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
                />
              </label>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold cursor-pointer"
              >
                Ajukan Permohonan Cuti
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Riwayat Pengajuan Cuti Saya</h3>
          {myLeaves.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada riwayat pengajuan cuti.</p>
          ) : (
            <div className="space-y-3">
              {myLeaves.map((lv) => (
                <div key={lv.id} className="p-4 rounded-xl border border-pink-100 bg-[#FFF5F8]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {lv.leaveType} ({lv.startDate} s/d {lv.endDate} · {lv.durationDays} hari)
                    </p>
                    <p className="text-xs text-slate-600">{lv.reason}</p>
                    {lv.rejectionReason && (
                      <p className="text-xs font-semibold text-rose-600 mt-1">
                        Alasan Penolakan: {lv.rejectionReason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg self-start sm:self-auto ${
                      lv.status === 'Approved'
                        ? 'bg-emerald-50 text-[#20C997]'
                        : lv.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {lv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Resign Mode (Sec 55)
  const myResigns = resignRequests.filter((r) => r.staffId === currentUser.id);
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-pink-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Formulir Pengajuan Resign (Pengunduran Diri)</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitResignRequest({
              submittedDate: new Date().toISOString().slice(0, 10),
              effectiveDate,
              reason: resignReason,
              additionalDetails: resignDetails,
            });
            setResignReason('');
            setResignDetails('');
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pengajuan
              </label>
              <input
                type="date"
                disabled
                value={new Date().toISOString().slice(0, 10)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Efektif Berhenti *
              </label>
              <input
                required
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Pengunduran Diri *
            </label>
            <input
              required
              type="text"
              value={resignReason}
              onChange={(e) => setResignReason(e.target.value)}
              placeholder="Alasan utama mengajukan resign..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detail Tambahan / Serah Terima Tugas *
            </label>
            <textarea
              required
              rows={3}
              value={resignDetails}
              onChange={(e) => setResignDetails(e.target.value)}
              placeholder="Rencana penyelesaian tanggung jawab sebelum tanggal efektif..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold cursor-pointer"
            >
              Kirim Pengajuan Resign
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Status Pengajuan Resign Saya</h3>
        {myResigns.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada pengajuan resign.</p>
        ) : (
          myResigns.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-pink-100 bg-[#FFF5F8]/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Efektif: {r.effectiveDate} · Diajukan: {r.submittedDate}
                </p>
                <p className="text-xs text-slate-600">{r.reason}</p>
                {r.rejectionReason && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    Alasan Ditolak: {r.rejectionReason}
                  </p>
                )}
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-50 text-amber-700">
                {r.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 7. SOP MEDIS (Sec 58 — Semua staff membaca, Heads+ dapat upload PDF, membuat & edit SOP)
export const SOPMedisView: React.FC = () => {
  const { sopDocuments, currentUser, addOrUpdateSOP } = useApp();
  const [selectedSop, setSelectedSop] = useState<typeof sopDocuments[0] | null>(sopDocuments[0] || null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof sopDocuments[0]['category']>('Prosedur UGD');
  const [version, setVersion] = useState('v1.0');
  const [content, setContent] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  if (!currentUser) return null;
  const canManage = currentUser.level >= 7;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-pink-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Standar Operasional Prosedur (SOP Medis)</h2>
          <p className="text-xs text-slate-500">
            Pedoman kerja resmi seluruh anggota Paramedic & Dokter RS Cendana
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingId(undefined);
              setTitle('');
              setVersion('v1.0');
              setContent('');
              setPdfFileName('');
              setShowEditor(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat / Upload SOP PDF (Heads+)</span>
          </button>
        )}
      </div>

      {showEditor && canManage && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addOrUpdateSOP(
              { title, category, version, content, pdfFileName: pdfFileName || undefined },
              editingId
            );
            setShowEditor(false);
          }}
          className="bg-white p-6 rounded-2xl border border-pink-200 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900">
            {editingId ? 'Perbarui Dokumen SOP' : 'Tambah Dokumen SOP Medis Baru'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul SOP *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Versi *</label>
              <input
                required
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Prosedur UGD">Prosedur UGD</option>
                <option value="Rawat Inap & Bedah">Rawat Inap & Bedah</option>
                <option value="Protokol Kriminal / Konflik">Protokol Kriminal / Konflik</option>
                <option value="Etika & Disiplin">Etika & Disiplin</option>
                <option value="Farmasi & Logistik">Farmasi & Logistik</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Dokumen SOP (.PDF)
              </label>
              <label className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-pink-200 bg-[#FFF5F8] text-xs cursor-pointer">
                <span className="truncate">{pdfFileName || 'Pilih file PDF SOP...'}</span>
                <Upload className="w-4 h-4 text-[#E83E8C]" />
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFileName(e.target.files?.[0]?.name || '')}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Lengkap SOP *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditor(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#E83E8C] text-white text-xs font-semibold cursor-pointer"
            >
              Simpan SOP
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          {sopDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedSop(doc)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                selectedSop?.id === doc.id
                  ? 'bg-[#FFF5F8] border-[#E83E8C]'
                  : 'bg-white border-pink-100 hover:border-pink-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{doc.category}</span>
                <span className="font-mono font-bold text-[#E83E8C]">{doc.version}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Diperbarui {doc.updatedAt} · Oleh {doc.author}
              </p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7">
          {selectedSop && (
            <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-pink-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#E83E8C]">
                    {selectedSop.category} · Versi {selectedSop.version}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedSop.title}</h3>
                  <p className="text-xs text-slate-500">
                    Pembuat: {selectedSop.author} · Terakhir diperbarui: {selectedSop.updatedAt}
                  </p>
                </div>
                {canManage && (
                  <button
                    onClick={() => {
                      setEditingId(selectedSop.id);
                      setTitle(selectedSop.title);
                      setCategory(selectedSop.category);
                      setVersion(selectedSop.version);
                      setContent(selectedSop.content);
                      setPdfFileName(selectedSop.pdfFileName || '');
                      setShowEditor(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-pink-200 text-xs font-semibold text-[#D63384] hover:bg-pink-50 cursor-pointer shrink-0"
                  >
                    Edit SOP
                  </button>
                )}
              </div>

              {selectedSop.pdfFileName && (
                <div className="p-3.5 rounded-xl bg-[#FFF5F8] border border-pink-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                    <BookOpen className="w-4 h-4 text-[#E83E8C]" />
                    <span>Lampiran Dokumen PDF: {selectedSop.pdfFileName}</span>
                  </div>
                  <span className="text-[11px] text-[#20C997] font-semibold">Terverifikasi</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedSop.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
