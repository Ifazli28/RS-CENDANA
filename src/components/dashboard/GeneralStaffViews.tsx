import React, { useState, useEffect } from 'react';
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
  Trash2,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
} from 'lucide-react';
import { LogoRSKotaBaru, LogoKotaBaruRoleplay } from '../BrandAssets';

// Helper to get real-time current week's Monday and Sunday (YYYY-MM-DD)
export function getCurrentWeekMondaySunday(nowDate: Date) {
  const d = new Date(nowDate);
  const day = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (dt: Date) => {
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fmtIndo = (dt: Date) =>
    dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    mondayDate: monday,
    sundayDate: sunday,
    mondayStr: fmt(monday),
    sundayStr: fmt(sunday),
    rangeLabel: `Senin, ${fmtIndo(monday)} – Minggu, ${fmtIndo(sunday)}`,
    monthPrefix: `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`,
    monthLabel: nowDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
  };
}

// 1. DASHBOARD HOME & LEADERBOARD DUTY (Sec 38 & 39)
export const DashboardLeaderboardView: React.FC = () => {
  const { dutyLogs, staffAccounts, currentUser } = useApp();
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month'>('week');
  const [nowTime, setNowTime] = useState<Date>(() => new Date());

  // Live real-time clock refresh so Monday-Sunday boundaries & time stay accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const weekBounds = React.useMemo(() => getCurrentWeekMondaySunday(nowTime), [nowTime]);

  // Aggregate total duty hours & session count ONLY for currently Active medical staff
  const leaderboardData = React.useMemo(() => {
    const activeStaffList = staffAccounts.filter((s) => s.status === 'Active');
    const activeStaffIds = new Set(activeStaffList.map((s) => s.id));

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

    // Seed ONLY with active staff (inactive or deleted staff are immediately excluded)
    activeStaffList.forEach((s) => {
      map.set(s.id, {
        staffId: s.id,
        name: s.name,
        role: s.role,
        avatarUrl: s.avatarUrl,
        totalMinutes: 0,
        sessions: 0,
      });
    });

    dutyLogs.forEach((log) => {
      // If staff is Inactive or deleted (not in activeStaffIds), skip immediately!
      if (!activeStaffIds.has(log.staffId)) return;

      const logDateStr = (log.startDate || '').slice(0, 10);
      const isInCurrentWeek =
        (logDateStr >= weekBounds.mondayStr && logDateStr <= weekBounds.sundayStr) ||
        log.weekKey === 'current-week';
      const isInCurrentMonth =
        logDateStr.startsWith(weekBounds.monthPrefix) || log.monthKey === weekBounds.monthPrefix;

      const matchesPeriod = periodFilter === 'week' ? isInCurrentWeek : isInCurrentMonth;
      if (!matchesPeriod) return;

      const existing = map.get(log.staffId);
      if (existing) {
        existing.totalMinutes += log.durationMinutes;
        existing.sessions += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [dutyLogs, staffAccounts, periodFilter, weekBounds]);

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
      <div className="p-6 rounded-2xl bg-white border border-red-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#9E1B21]">
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
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div className="flex items-center gap-1.5 p-1 bg-red-50/40 rounded-xl border border-red-100">
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                periodFilter === 'week'
                  ? 'bg-[#9E1B21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#7F1D1D]'
              }`}
            >
              Minggu Ini (Sen–Min)
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                periodFilter === 'month'
                  ? 'bg-[#9E1B21] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#7F1D1D]'
              }`}
            >
              Bulan Ini ({weekBounds.monthLabel})
            </button>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {periodFilter === 'week' ? weekBounds.rangeLabel : `Periode: ${weekBounds.monthLabel}`} · Live Sync Aktif
          </span>
        </div>
      </div>

      {/* Leaderboard Podium Top 1-3 (Sec 39: #1, #2, #3 lebih menonjol, modern medical premium) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#9E1B21]" />
            <h3 className="text-lg font-bold text-slate-900">
              Leaderboard Jam Duty Paramedic Kota Baru
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
                    ? 'bg-gradient-to-br from-[#FFF5F8] via-white to-red-50/50/70 border-[#9E1B21] shadow-md'
                    : 'bg-white border-red-100 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-2xl font-extrabold font-mono tabular-nums ${
                      isFirst
                        ? 'text-[#9E1B21]'
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
                    } rounded-2xl object-cover border-2 border-red-200 shrink-0`}
                  />
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{item.role}</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#7F1D1D] tabular-nums">
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
        <div className="bg-white rounded-2xl border border-red-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-red-100 flex items-center justify-between">
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
                <tr className="border-b border-red-50/50 text-[11px] font-semibold text-slate-500 bg-red-50/40/60">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Staff Medis</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4 text-right">Jumlah Sesi</th>
                  <th className="py-3 px-4 text-right">Total Jam Duty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50 text-sm">
                {restRanking.map((item, idx) => (
                  <tr key={item.staffId} className="hover:bg-red-50/60/30 transition">
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
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#7F1D1D] tabular-nums">
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
      <div className="bg-white rounded-2xl border border-red-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          referrerPolicy="no-referrer"
          className="w-24 h-24 rounded-2xl object-cover border-2 border-[#9E1B21]"
        />
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
          <p className="text-sm font-semibold text-[#9E1B21]">
            {currentUser.role} (Level {currentUser.level})
          </p>
          <p className="text-xs text-slate-500">
            {currentUser.email} · Bergabung {currentUser.joinDate}
          </p>
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50/40 border border-red-200 text-xs font-semibold text-[#7F1D1D] hover:bg-red-100 cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Upload Foto Profil Baru (.JPG) — Live Preview</span>
              <input type="file" accept=".jpg,.jpeg" className="hidden" onChange={handleJpgUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sec 41: Ganti Password */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-red-100 pb-3">
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
            <div className="p-3 rounded-xl bg-red-50/40 text-[11px] text-slate-600 space-y-1">
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
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
            >
              Simpan Password Baru
            </button>
          </form>
        </div>

        {/* Sec 42: Pengaturan Email */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-red-100 pb-3">
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
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-red-100">
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
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#9E1B21] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeSorted.map((st) => (
          <div
            key={st.id}
            className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs flex flex-col justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={st.avatarUrl}
                alt={st.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-red-200 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{st.name}</h3>
                <p className="text-xs font-semibold text-[#9E1B21]">
                  {st.role} · Level {st.level}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {st.specialty || 'Tenaga Medis RS Kota Baru'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStaff(st)}
              className="w-full py-2 px-3 rounded-xl bg-red-50/40 hover:bg-red-100 text-[#7F1D1D] text-xs font-semibold transition cursor-pointer"
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
            className="bg-white rounded-2xl border border-red-100 p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <img
                src={selectedStaff.avatarUrl}
                alt={selectedStaff.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-red-200"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStaff.name}</h3>
                <p className="text-xs font-semibold text-[#9E1B21]">
                  {selectedStaff.role} (Level {selectedStaff.level})
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-2 border-t border-red-100 pt-3">
              <p>
                <strong>Bidang / Spesialisasi:</strong> {selectedStaff.specialty || '-'}
              </p>
              <p>
                <strong>Tanggal Bergabung:</strong> {selectedStaff.joinDate}
              </p>
              <p>
                <strong>Tentang Staff:</strong>{' '}
                {selectedStaff.bio || 'Anggota resmi unit pelayanan medis Rumah Sakit Kota Baru.'}
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

// 4. VOTING INTERNAL (Sec 51 — Semua staff aktif memilih 1x, Heads+ dapat membuat & menghapus voting)
export const VotingView: React.FC = () => {
  const { votingPolls, currentUser, castVote, createVotingPoll, deleteVotingPoll } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [optionsText, setOptionsText] = useState('Opsi 1\nOpsi 2');
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);

  if (!currentUser) return null;
  const canCreate = currentUser.level >= 8;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-red-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Voting & Jajak Pendapat Internal</h2>
          <p className="text-xs text-slate-500">
            Satu staff hanya dapat memberikan 1 suara pada setiap pemungutan suara
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Voting Baru (HRD+)</span>
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
          className="bg-white p-6 rounded-2xl border border-red-200 space-y-4"
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
              className="px-5 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-semibold cursor-pointer"
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
            <div key={poll.id} className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{poll.title}</h3>
                  <p className="text-xs text-slate-500">
                    Dibuat oleh {poll.createdBy} · Batas Waktu: {poll.deadline} · Status:{' '}
                    <strong className="text-[#20C997]">{poll.status}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                    Total {totalVotes} Suara
                  </span>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => setDeletingPollId(poll.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Voting</span>
                    </button>
                  )}
                </div>
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
                        isSelected ? 'border-[#9E1B21] bg-red-50/40' : 'border-slate-200 bg-white'
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
                              className="px-3 py-1 rounded-lg bg-[#9E1B21] text-white text-xs font-semibold hover:opacity-95 cursor-pointer"
                            >
                              Pilih
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-red-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#9E1B21] to-[#20C997]"
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

      {deletingPollId && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeletingPollId(null)}
        >
          <div
            className="bg-white rounded-2xl border border-rose-200 p-6 max-w-md w-full space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Voting</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus jajak pendapat / voting ini secara permanen dari portal dan database?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPollId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteVotingPoll(deletingPollId);
                  setDeletingPollId(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Ya, Hapus Voting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. GAJI SAYA (Sec 52 — Terintegrasi Skema Gaji Jabatan, Target Jam Mingguan, Gaji Utuh/Perjam & Bonus Kelipatan)
export const MySalaryView: React.FC = () => {
  const { payrollRecords, dutyLogs, roleSalaryConfigs, currentUser } = useApp();
  const [selectedSlipToPrint, setSelectedSlipToPrint] = useState<(typeof payrollRecords)[0] | null>(null);
  const [showDutyLogsList, setShowDutyLogsList] = useState(false);

  if (!currentUser) return null;

  const myRoleConfig = roleSalaryConfigs.find((c) => c.role === currentUser.role);
  
  // Filter contributing logs for the current week matching by ID or by Staff Name
  const myWeeklyDutyLogs = dutyLogs.filter(
    (l) =>
      (l.staffId === currentUser.id ||
        l.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) &&
      l.weekKey === 'current-week'
  );

  const myWeeklyMinutes = myWeeklyDutyLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const dutyHours = Number((myWeeklyMinutes / 60).toFixed(2));
  const targetHours = myRoleConfig?.targetWeeklyHours ?? 18;
  const meetsTarget = dutyHours >= targetHours;
  const baseEarned = myRoleConfig
    ? meetsTarget
      ? myRoleConfig.fullSalary
      : Math.round(dutyHours * myRoleConfig.hourlyRate)
    : 0;

  const excessHours =
    myRoleConfig && dutyHours > targetHours
      ? Number((dutyHours - targetHours).toFixed(2))
      : 0;
  const bonusMultiples =
    myRoleConfig && excessHours > 0 && myRoleConfig.bonusStepHours > 0
      ? Math.floor(excessHours / myRoleConfig.bonusStepHours)
      : 0;
  const liveBonus = myRoleConfig ? bonusMultiples * myRoleConfig.bonusPerStepAmount : 0;
  const estimatedTakeHome = baseEarned + liveBonus;

  const progressPercent = Math.min(100, Math.round((dutyHours / targetHours) * 100));

  const myPayrolls = payrollRecords.filter((p) => p.staffId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Header Info Jabatan & Skema Gaji */}
      <div className="bg-white p-5 rounded-2xl border border-red-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#9E1B21] text-white">
              LEVEL {currentUser.level}
            </span>
            <span className="text-xs font-bold text-[#9E1B21] tracking-wide uppercase">
              {currentUser.role}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Gaji Saya & Estimasi Mingguan Real-Time</h2>
          <p className="text-xs text-slate-500">
            Sistem otomatis menghitung gaji berdasarkan jam kerja (Duty Log) dan target mingguan jabatan Anda.
          </p>
        </div>

        {myRoleConfig ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-blue-50/80 border border-blue-200/70">
              <span className="text-[10px] text-blue-600 block uppercase font-bold">Target Jam Duty</span>
              <strong className="text-blue-900 font-mono text-sm">{myRoleConfig.targetWeeklyHours} Jam/Minggu</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/70">
              <span className="text-[10px] text-emerald-600 block uppercase font-bold">Gaji Utuh (Capaian)</span>
              <strong className="text-emerald-900 font-mono text-sm">${myRoleConfig.fullSalary.toLocaleString()}</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200/70">
              <span className="text-[10px] text-amber-600 block uppercase font-bold">Gaji Per Jam (&lt; Target)</span>
              <strong className="text-amber-900 font-mono text-sm">${myRoleConfig.hourlyRate.toLocaleString()}/jam</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-purple-50/80 border border-purple-200/70">
              <span className="text-[10px] text-purple-600 block uppercase font-bold">Bonus Lembur</span>
              <strong className="text-purple-900 font-mono text-sm">+${myRoleConfig.bonusPerStepAmount.toLocaleString()} / +{myRoleConfig.bonusStepHours}j</strong>
            </div>
          </div>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
            Skema gaji untuk jabatan Anda sedang disiapkan oleh HRD.
          </div>
        )}
      </div>

      {/* Kartu Kalkulasi Jam Duty Minggu Berjalan */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#9E1B21] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              KALKULASI MINGGU BERJALAN (REAL-TIME DARI DISCORD / DUTY LOG)
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {dutyHours} Jam <span className="text-sm font-normal text-slate-500">/ target {targetHours} Jam</span>
            </h3>
          </div>
          <span
            className={`px-3.5 py-2 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 ${
              meetsTarget
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {meetsTarget ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Target Tercapai (Berhak Gaji Utuh Penuh)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Kurang {(targetHours - dutyHours).toFixed(2)}j (Dihitung Per Jam × ${myRoleConfig?.hourlyRate ?? 0})</span>
              </>
            )}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span>Pencapaian Jam Duty Mingguan</span>
            <span className="font-bold font-mono text-slate-900">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                meetsTarget ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-[#9E1B21]'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm tabular-nums">
          <div className="p-4 rounded-xl bg-red-50/40 border border-red-100">
            <p className="text-xs text-slate-500">Status Perhitungan Gaji</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              {meetsTarget ? 'Gaji Utuh' : 'Gaji Per Jam'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {meetsTarget ? 'Target mingguan terpenuhi' : `${dutyHours} jam × $${myRoleConfig?.hourlyRate ?? 0}`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-50/40 border border-red-100">
            <p className="text-xs text-slate-500">Gaji Pokok Terhitung</p>
            <p className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              ${baseEarned.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {meetsTarget ? `Skema utuh ${currentUser.role}` : 'Sesuai durasi riil'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-50/40 border border-red-100">
            <p className="text-xs text-slate-500">
              Bonus Kelebihan Jam ({bonusMultiples}x)
            </p>
            <p className="text-xl font-extrabold font-mono text-emerald-600 mt-1">
              +${liveBonus.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {excessHours > 0 ? `+${excessHours}j di atas target` : 'Tidak ada lembur'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#9E1B21] via-[#85161B] to-[#500e12] text-white shadow-xs">
            <p className="text-xs text-red-100 font-semibold">Estimasi Take Home Pay</p>
            <p className="text-2xl font-extrabold font-mono mt-1">
              ${estimatedTakeHome.toLocaleString()}
            </p>
            <p className="text-[10px] text-red-200 mt-0.5">
              Minggu Ini (Belum potongan/tunjangan)
            </p>
          </div>
        </div>

        {/* Contributing Duty Logs Accordion */}
        <div className="pt-2">
          <button
            onClick={() => setShowDutyLogsList(!showDutyLogsList)}
            className="flex items-center gap-2 text-xs font-bold text-[#9E1B21] hover:text-[#7F1D1D] transition cursor-pointer"
          >
            {showDutyLogsList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>
              {showDutyLogsList ? 'Sembunyikan' : 'Lihat'} Rincian Sesi Duty Minggu Ini ({myWeeklyDutyLogs.length} Log Terdata)
            </span>
          </button>

          {showDutyLogsList && (
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50">
              {myWeeklyDutyLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Belum ada log duty yang tercatat atas nama Anda pada minggu berjalan ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3">Waktu Mulai</th>
                      <th className="py-2.5 px-3">Waktu Selesai</th>
                      <th className="py-2.5 px-3">Pekerjaan</th>
                      <th className="py-2.5 px-3 text-right">Durasi Menit</th>
                      <th className="py-2.5 px-3 text-right">Format</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white tabular-nums">
                    {myWeeklyDutyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-red-50/40">
                        <td className="py-2 px-3 font-mono text-slate-700">{log.startDate}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{log.endDate}</td>
                        <td className="py-2 px-3 font-medium text-slate-900 capitalize">{log.jobTitleInLog}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {log.durationMinutes} min
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">
                          {log.durationFormatted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daftar Slip Gaji Resmi dari HRD/Database */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Slip Gaji Resmi</h3>
            <p className="text-xs text-slate-500">
              Slip gaji yang telah diverifikasi dan diterbitkan resmi oleh Bagian Keuangan / HRD RS Kota Baru.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">
            {myPayrolls.length} Slip Tersedia
          </span>
        </div>

        {myPayrolls.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-red-100 text-center text-sm text-slate-500 shadow-xs">
            Belum ada catatan slip gaji resmi yang diterbitkan untuk akun Anda pada periode ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myPayrolls.map((pay) => (
              <div
                key={pay.id}
                className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs space-y-4 hover:border-red-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[#9E1B21] uppercase tracking-wider">
                      SLIP GAJI RESMI RS KOTA BARU
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 mt-0.5">Periode: {pay.period}</h4>
                    <p className="text-xs text-slate-500">
                      {pay.staffName} · Jabatan: <strong>{pay.role}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Status Pembayaran</span>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          pay.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : pay.paymentStatus === 'Processing'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {pay.paymentStatus} {pay.paidAt && `(${pay.paidAt})`}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedSlipToPrint(pay)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Slip</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm tabular-nums">
                  <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-100/60">
                    <p className="text-xs text-slate-500">Gaji Pokok</p>
                    <p className="text-base font-bold font-mono text-slate-900">
                      ${pay.basicSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-100/60">
                    <p className="text-xs text-slate-500">Bonus Duty ({pay.dutyHours}j)</p>
                    <p className="text-base font-bold font-mono text-emerald-600">
                      +${pay.dutyBonus.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-100/60">
                    <p className="text-xs text-slate-500">Tunjangan Tambahan</p>
                    <p className="text-base font-bold font-mono text-emerald-600">
                      +${pay.allowance.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-100/60">
                    <p className="text-xs text-slate-500">Potongan</p>
                    <p className="text-base font-bold font-mono text-rose-600">
                      -${pay.deduction.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white">
                    <p className="text-xs text-red-100">Take Home Pay</p>
                    <p className="text-xl font-extrabold font-mono">
                      ${pay.totalSalary.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL PRINT SLIP GAJI RESMI */}
      {selectedSlipToPrint && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white"
          onClick={() => setSelectedSlipToPrint(null)}
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
                  onClick={() => setSelectedSlipToPrint(null)}
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
              <p className="text-xs text-slate-500 mt-0.5">Periode Penggajian: {selectedSlipToPrint.period}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Tenaga Medis</span>
                <strong className="text-slate-900 text-sm">{selectedSlipToPrint.staffName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Jabatan Resmi</span>
                <strong className="text-[#9E1B21] text-sm">{selectedSlipToPrint.role}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Jam Duty</span>
                <strong className="text-slate-900 font-mono text-sm">{selectedSlipToPrint.dutyHours} Jam</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Pembayaran</span>
                <strong className="text-emerald-700 font-mono text-sm">
                  {selectedSlipToPrint.paymentStatus} {selectedSlipToPrint.paidAt && `(${selectedSlipToPrint.paidAt})`}
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
                      Gaji Pokok (Berdasarkan Jam Kerja & Jabatan)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${selectedSlipToPrint.basicSalary.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">
                      Bonus Kelebihan Jam Duty ({selectedSlipToPrint.dutyHours}j)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                      +${selectedSlipToPrint.dutyBonus.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">Tunjangan Tambahan / Insentif</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">
                      +${selectedSlipToPrint.allowance.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-800">Potongan Administrasi / Disiplin</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                      -${selectedSlipToPrint.deduction.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-red-50/60 font-extrabold text-sm border-t-2 border-red-200">
                    <td className="py-3 px-4 text-[#9E1B21]">TOTAL TAKE HOME PAY (BERSIH)</td>
                    <td className="py-3 px-4 text-right font-mono text-[#9E1B21] text-base">
                      ${selectedSlipToPrint.totalSalary.toLocaleString()}
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
                  {selectedSlipToPrint.staffName}
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                  {selectedSlipToPrint.staffName}
                </div>
                <span className="text-[10px] text-slate-400">{selectedSlipToPrint.role}</span>
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

// 6. PENGAJUAN CUTI & PENGAJUAN RESIGN (Sec 53 & 55)
export const LeaveAndResignView: React.FC<{ mode: 'leave' | 'resign' }> = ({ mode }) => {
  const { currentUser, leaveRequests, resignRequests, submitLeaveRequest, submitResignRequest, deleteLeaveRequest, deleteResignRequest, requestDelete } =
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
        <div className="bg-white p-6 rounded-2xl border border-red-100 space-y-4">
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
              <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-red-200 bg-red-50/40 text-xs cursor-pointer">
                <span className="truncate">{attachmentName || 'Pilih file...'}</span>
                <Upload className="w-4 h-4 text-[#9E1B21]" />
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold cursor-pointer"
              >
                Ajukan Permohonan Cuti
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Riwayat Pengajuan Cuti Saya</h3>
          {myLeaves.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada riwayat pengajuan cuti.</p>
          ) : (
            <div className="space-y-3">
              {myLeaves.map((lv) => (
                <div key={lv.id} className="p-4 rounded-xl border border-red-100 bg-red-50/40/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        lv.status === 'Approved'
                          ? 'bg-emerald-50 text-[#20C997]'
                          : lv.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {lv.status}
                    </span>
                    <button
                      onClick={() => {
                        requestDelete(
                          'Batalkan Pengajuan Cuti',
                          `Apakah Anda yakin ingin membatalkan dan menghapus permohonan cuti periode ${lv.startDate} s/d ${lv.endDate}?`,
                          () => deleteLeaveRequest(lv.id)
                        );
                      }}
                      title="Hapus / Batalkan Cuti"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
      <div className="bg-white p-6 rounded-2xl border border-red-100 space-y-4">
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold cursor-pointer"
            >
              Kirim Pengajuan Resign
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Status Pengajuan Resign Saya</h3>
        {myResigns.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada pengajuan resign.</p>
        ) : (
          myResigns.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-red-100 bg-red-50/40/50 flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-50 text-amber-700">
                  {r.status}
                </span>
                <button
                  onClick={() => {
                    requestDelete(
                      'Batalkan Pengajuan Resign',
                      `Apakah Anda yakin ingin membatalkan dan menghapus permohonan resign (efektif ${r.effectiveDate})?`,
                      () => deleteResignRequest(r.id)
                    );
                  }}
                  title="Hapus / Batalkan Resign"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 7. SOP MEDIS (Sec 58 — Semua staff membaca, Heads+ dapat upload PDF, membuat & edit SOP)
export const SOPMedisView: React.FC = () => {
  const { sopDocuments, currentUser, addOrUpdateSOP, deleteSOPDocument, requestDelete } = useApp();
  const [selectedSop, setSelectedSop] = useState<typeof sopDocuments[0] | null>(sopDocuments[0] || null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof sopDocuments[0]['category']>('Prosedur UGD');
  const [version, setVersion] = useState('v1.0');
  const [content, setContent] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  if (!currentUser) return null;
  const canManage = currentUser.level >= 8;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-red-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Standar Operasional Prosedur (SOP Medis)</h2>
          <p className="text-xs text-slate-500">
            Pedoman kerja resmi seluruh anggota Paramedic & Dokter RS Kota Baru
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
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat / Upload SOP PDF (HRD+)</span>
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
          className="bg-white p-6 rounded-2xl border border-red-200 space-y-4"
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
              <label className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-red-200 bg-red-50/40 text-xs cursor-pointer">
                <span className="truncate">{pdfFileName || 'Pilih file PDF SOP...'}</span>
                <Upload className="w-4 h-4 text-[#9E1B21]" />
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
              className="px-5 py-2 rounded-xl bg-[#9E1B21] text-white text-xs font-semibold cursor-pointer"
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
                  ? 'bg-red-50/40 border-[#9E1B21]'
                  : 'bg-white border-red-100 hover:border-red-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{doc.category}</span>
                <span className="font-mono font-bold text-[#9E1B21]">{doc.version}</span>
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
            <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-red-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#9E1B21]">
                    {selectedSop.category} · Versi {selectedSop.version}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedSop.title}</h3>
                  <p className="text-xs text-slate-500">
                    Pembuat: {selectedSop.author} · Terakhir diperbarui: {selectedSop.updatedAt}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2 shrink-0">
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
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-[#7F1D1D] hover:bg-red-50/60 cursor-pointer"
                    >
                      Edit SOP
                    </button>
                    <button
                      onClick={() => {
                        requestDelete(
                          'Hapus Dokumen SOP',
                          `Apakah Anda yakin ingin menghapus dokumen SOP "${selectedSop.title}"?`,
                          () => {
                            deleteSOPDocument(selectedSop.id);
                            setSelectedSop(null);
                          }
                        );
                      }}
                      title="Hapus Dokumen SOP"
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>

              {selectedSop.pdfFileName && (
                <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                    <BookOpen className="w-4 h-4 text-[#9E1B21]" />
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
