import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Award,
  Bell,
  HeartPulse,
  ExternalLink,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { LogoRSKotaBaru, LogoKotaBaruRoleplay } from '../BrandAssets';
import {
  getMondayOfDate,
  getSundayOfMonday,
  formatWeekRangeDisplay,
  formatMonthDisplay,
  getCurrentMonthKey,
  getCurrentDateStr,
  shiftWeekMonday,
  isDateInWeek,
  getAvailableWeeksList,
  normalizeDateOnly,
} from '../../utils/dateUtils';

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

// 1. DASHBOARD PRIBADI, INFORMASI-INFORMASI & LEADERBOARD MINGGUAN & BULANAN
interface DashboardLeaderboardViewProps {
  onNavigateRoute?: (route: any) => void;
}

export const DashboardLeaderboardView: React.FC<DashboardLeaderboardViewProps> = ({ onNavigateRoute }) => {
  const {
    dutyLogs,
    staffAccounts,
    currentUser,
    roleSalaryConfigs,
    payrollRecords,
    doctorSchedules,
    regulations,
    recruitmentStatus,
  } = useApp();

  // Leaderboard Period Toggle: 'weekly' vs 'monthly'
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedWeekMonday, setSelectedWeekMonday] = useState<string>(() => getMondayOfDate(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthKey());
  const [searchQuery, setSearchQuery] = useState('');

  const currentRunningMonday = useMemo(() => getMondayOfDate(new Date()), []);
  const currentRunningMonth = useMemo(() => getCurrentMonthKey(), []);
  const availableWeeks = useMemo(() => getAvailableWeeksList(dutyLogs.map((l) => l.startDate)), [dutyLogs]);

  // Current user's role salary configuration
  const userRoleCfg = useMemo(() => {
    if (!currentUser) return undefined;
    return roleSalaryConfigs.find((c) => c.role === currentUser.role);
  }, [roleSalaryConfigs, currentUser]);

  // 1. PERSONAL METRICS: Weekly logs for current running week
  const myCurrentWeekLogs = useMemo(() => {
    if (!currentUser) return [];
    return dutyLogs.filter((l) => {
      const isStaff =
        l.staffId === currentUser.id ||
        l.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
      if (!isStaff) return false;
      return isDateInWeek(l.startDate, currentRunningMonday);
    });
  }, [dutyLogs, currentUser, currentRunningMonday]);

  const myWeeklyMinutes = useMemo(() => {
    return myCurrentWeekLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  }, [myCurrentWeekLogs]);

  const myWeeklyHoursNum = Number((myWeeklyMinutes / 60).toFixed(2));

  // 2. PERSONAL METRICS: Monthly logs for current running month
  const myCurrentMonthLogs = useMemo(() => {
    if (!currentUser) return [];
    return dutyLogs.filter((l) => {
      const isStaff =
        l.staffId === currentUser.id ||
        l.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
      if (!isStaff) return false;
      const mKey = normalizeDateOnly(l.startDate).slice(0, 7);
      return mKey === currentRunningMonth || l.monthKey === currentRunningMonth;
    });
  }, [dutyLogs, currentUser, currentRunningMonth]);

  const myMonthlyMinutes = useMemo(() => {
    return myCurrentMonthLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  }, [myCurrentMonthLogs]);

  const myMonthlyHoursNum = Number((myMonthlyMinutes / 60).toFixed(2));

  // 3. PERSONAL SALARY & TARGET CALCULATIONS
  const targetWeeklyHours = userRoleCfg?.targetWeeklyHours ?? 18;
  const hourlyRate = userRoleCfg?.hourlyRate ?? 350;
  const fullSalary = userRoleCfg?.fullSalary ?? 6300;
  const meetsTarget = myWeeklyHoursNum >= targetWeeklyHours;
  const targetPercent = Math.min(100, Math.round((myWeeklyHoursNum / (targetWeeklyHours || 1)) * 100));

  const baseEarned = meetsTarget ? fullSalary : Math.round(myWeeklyHoursNum * hourlyRate);
  let excessHours = 0;
  let bonusMultiples = 0;
  let dutyBonus = 0;
  if (myWeeklyHoursNum > targetWeeklyHours && (userRoleCfg?.bonusStepHours ?? 0) > 0) {
    excessHours = Number((myWeeklyHoursNum - targetWeeklyHours).toFixed(2));
    bonusMultiples = Math.floor(excessHours / (userRoleCfg?.bonusStepHours ?? 1));
    dutyBonus = bonusMultiples * (userRoleCfg?.bonusPerStepAmount ?? 0);
  }
  const estimatedWeeklyTotal = baseEarned + dutyBonus;

  // Check saved payroll for the current running week
  const myCurrentWeekPayroll = useMemo(() => {
    if (!currentUser) return null;
    return (
      payrollRecords.find(
        (p) =>
          p.staffId === currentUser.id &&
          (p.weekKey === currentRunningMonday || (p.period && p.period.includes(currentRunningMonday)))
      ) || null
    );
  }, [payrollRecords, currentUser, currentRunningMonday]);

  // 4. PERSONAL RECENT SESSIONS (Last 4 sessions)
  const myRecentSessions = useMemo(() => {
    if (!currentUser) return [];
    return dutyLogs
      .filter((l) => {
        return (
          l.staffId === currentUser.id ||
          l.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
        );
      })
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
      .slice(0, 4);
  }, [dutyLogs, currentUser]);

  // 5. AGGREGATE LEADERBOARD DATA: WEEKLY
  const weeklyLeaderboardData = useMemo(() => {
    const activeStaffList = staffAccounts.filter((s) => s.status === 'Active');
    const activeStaffIds = new Set(activeStaffList.map((s) => s.id));

    const map = new Map<
      string,
      {
        staffId: string;
        name: string;
        role: string;
        level: number;
        avatarUrl: string;
        totalMinutes: number;
        sessions: number;
        targetHours: number;
      }
    >();

    activeStaffList.forEach((s) => {
      const cfg = roleSalaryConfigs.find((c) => c.role === s.role);
      map.set(s.id, {
        staffId: s.id,
        name: s.name,
        role: s.role,
        level: s.level,
        avatarUrl: s.avatarUrl,
        totalMinutes: 0,
        sessions: 0,
        targetHours: cfg?.targetWeeklyHours ?? 18,
      });
    });

    dutyLogs.forEach((log) => {
      if (!activeStaffIds.has(log.staffId)) return;
      if (isDateInWeek(log.startDate, selectedWeekMonday)) {
        const entry = map.get(log.staffId);
        if (entry) {
          entry.totalMinutes += log.durationMinutes;
          entry.sessions += 1;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [dutyLogs, staffAccounts, roleSalaryConfigs, selectedWeekMonday]);

  // 6. AGGREGATE LEADERBOARD DATA: MONTHLY
  const monthlyLeaderboardData = useMemo(() => {
    const activeStaffList = staffAccounts.filter((s) => s.status === 'Active');
    const activeStaffIds = new Set(activeStaffList.map((s) => s.id));

    const map = new Map<
      string,
      {
        staffId: string;
        name: string;
        role: string;
        level: number;
        avatarUrl: string;
        totalMinutes: number;
        sessions: number;
        targetHours: number;
      }
    >();

    activeStaffList.forEach((s) => {
      const cfg = roleSalaryConfigs.find((c) => c.role === s.role);
      map.set(s.id, {
        staffId: s.id,
        name: s.name,
        role: s.role,
        level: s.level,
        avatarUrl: s.avatarUrl,
        totalMinutes: 0,
        sessions: 0,
        targetHours: (cfg?.targetWeeklyHours ?? 18) * 4,
      });
    });

    dutyLogs.forEach((log) => {
      if (!activeStaffIds.has(log.staffId)) return;
      const mKey = normalizeDateOnly(log.startDate).slice(0, 7);
      if (mKey === selectedMonth || log.monthKey === selectedMonth) {
        const entry = map.get(log.staffId);
        if (entry) {
          entry.totalMinutes += log.durationMinutes;
          entry.sessions += 1;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [dutyLogs, staffAccounts, roleSalaryConfigs, selectedMonth]);

  // Active dataset
  const activeLeaderboard = leaderboardPeriod === 'weekly' ? weeklyLeaderboardData : monthlyLeaderboardData;

  // Filtered leaderboard by search query
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return activeLeaderboard;
    const q = searchQuery.toLowerCase().trim();
    return activeLeaderboard.filter(
      (item) => item.name.toLowerCase().includes(q) || item.role.toLowerCase().includes(q)
    );
  }, [activeLeaderboard, searchQuery]);

  const topThree = filteredLeaderboard.slice(0, 3);
  const restRanking = filteredLeaderboard.slice(3);

  // My Ranks
  const myWeeklyRankIndex = weeklyLeaderboardData.findIndex((item) => item.staffId === currentUser?.id);
  const myWeeklyRank = myWeeklyRankIndex >= 0 ? myWeeklyRankIndex + 1 : null;

  const myMonthlyRankIndex = monthlyLeaderboardData.findIndex((item) => item.staffId === currentUser?.id);
  const myMonthlyRank = myMonthlyRankIndex >= 0 ? myMonthlyRankIndex + 1 : null;

  // Available Doctors
  const availableDoctors = useMemo(() => {
    return doctorSchedules.filter((d) => d.status === 'Available');
  }, [doctorSchedules]);

  const activeStaffCount = useMemo(() => {
    return staffAccounts.filter((s) => s.status === 'Active').length;
  }, [staffAccounts]);

  const formatHoursMinutes = (mins: number) => {
    const totalMins = Math.round(mins);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}j ${m}m`;
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      {/* ============================================================== */}
      {/* 1. BAGIAN DASHBOARD PRIBADI (PERSONAL DASHBOARD & IDENTITY)   */}
      {/* ============================================================== */}
      <section className="space-y-4">
        {/* Hero Card Pribadi */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7F1D1D] via-[#9E1B21] to-[#5A0C10] text-white p-6 sm:p-8 shadow-xl border border-red-900/40">
          {/* Subtle medical background pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <HeartPulse className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Foto & Identitas Pribadi */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-3 border-white/80 shadow-md bg-white/10"
                />
                <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-[#20C997] text-white text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Aktif
                </span>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold tracking-wider uppercase text-red-100 border border-white/20">
                    Level {currentUser.level} · {currentUser.role}
                  </span>
                  {currentUser.specialty && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-semibold border border-amber-400/30">
                      {currentUser.specialty}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                  Selamat Bertugas, {currentUser.name}
                </h1>

                <p className="text-xs sm:text-sm text-red-100/90 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>NIP / Staff ID: <strong className="font-mono text-white">RSKB-{currentUser.id.slice(0, 5).toUpperCase()}</strong></span>
                  <span>•</span>
                  <span>Bergabung: <strong className="text-white">{currentUser.joinDate || '2026-01-01'}</strong></span>
                </p>
              </div>
            </div>

            {/* Quick Actions & Profile Link */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              {onNavigateRoute && (
                <>
                  <button
                    onClick={() => onNavigateRoute('my-salary')}
                    className="px-4 py-2.5 rounded-xl bg-white text-[#9E1B21] text-xs font-bold hover:bg-red-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4 text-[#9E1B21]" />
                    <span>Slip Gaji Saya</span>
                  </button>
                  <button
                    onClick={() => onNavigateRoute('leave-request')}
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Umbrella className="w-4 h-4" />
                    <span>Pengajuan Cuti</span>
                  </button>
                  <button
                    onClick={() => onNavigateRoute('profile')}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition border border-white/20 cursor-pointer"
                    title="Buka Pengaturan Profil & Keamanan"
                  >
                    Profil
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4 Kartu KPI Kinerja & Status Pribadi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Jam Duty Minggu Ini */}
          <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9E1B21]" />
                Duty Minggu Ini
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {myCurrentWeekLogs.length} Sesi
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {formatHoursMinutes(myWeeklyMinutes)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  / {targetWeeklyHours}j Target
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    meetsTarget ? 'bg-[#20C997]' : 'bg-[#9E1B21]'
                  }`}
                  style={{ width: `${targetPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              {meetsTarget ? (
                <span className="text-[#20C997] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Target Tercapai (Gaji Utuh)
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Kurang {(targetWeeklyHours - myWeeklyHoursNum).toFixed(1)}j lagi
                </span>
              )}
              <span className="font-mono font-bold text-slate-600">{targetPercent}%</span>
            </div>
          </div>

          {/* Card 2: Estimasi Gaji Minggu Ini */}
          <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#20C997]" />
                Estimasi Gaji Minggu Ini
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  myCurrentWeekPayroll?.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : myCurrentWeekPayroll?.paymentStatus === 'Processing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {myCurrentWeekPayroll ? myCurrentWeekPayroll.paymentStatus : 'Berjalan'}
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold font-mono text-[#7F1D1D] tabular-nums">
                ${estimatedWeeklyTotal.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pokok: ${baseEarned.toLocaleString()} {dutyBonus > 0 && `· Bonus: +$${dutyBonus.toLocaleString()}`}
              </p>
            </div>

            <div className="pt-1">
              {onNavigateRoute ? (
                <button
                  onClick={() => onNavigateRoute('my-salary')}
                  className="text-[11px] font-bold text-[#9E1B21] hover:text-[#7F1D1D] flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Rincian Slip Gaji</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Periode: Minggu Berjalan</span>
              )}
            </div>
          </div>

          {/* Card 3: Jam Duty Bulan Ini */}
          <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Duty Bulan Ini
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {formatMonthDisplay(currentRunningMonth)}
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {formatHoursMinutes(myMonthlyMinutes)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Total {myCurrentMonthLogs.length} sesi tugas pada bulan ini
              </p>
            </div>

            <div className="pt-1 text-[11px] font-medium text-slate-600 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#20C997]" />
              <span>Rata-rata: {myCurrentMonthLogs.length > 0 ? (myMonthlyHoursNum / myCurrentMonthLogs.length).toFixed(1) : 0}j per sesi</span>
            </div>
          </div>

          {/* Card 4: Peringkat Leaderboard Saya */}
          <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Peringkat Saya
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Staff Medis
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-2xl font-extrabold font-mono text-amber-600 tabular-nums">
                  #{myWeeklyRank || '-'}
                </span>
                <span className="text-xs text-slate-400 ml-1">Minggu Ini</span>
              </div>
              <span className="text-slate-300">/</span>
              <div>
                <span className="text-xl font-bold font-mono text-slate-700 tabular-nums">
                  #{myMonthlyRank || '-'}
                </span>
                <span className="text-xs text-slate-400 ml-1">Bulan Ini</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Dari total <strong>{activeStaffCount}</strong> tenaga medis aktif di database
            </p>
          </div>
        </div>

        {/* Riwayat 4 Sesi Duty Terakhir Saya */}
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9E1B21]" />
              <span>Riwayat Sesi Duty Terakhir Saya</span>
            </h3>
            <span className="text-xs text-slate-400">
              Menampilkan {myRecentSessions.length} sesi terbaru
            </span>
          </div>

          {myRecentSessions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">
              Belum ada riwayat sesi duty tercatat untuk akun Anda. Mulai bertugas untuk merekam jam duty.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {myRecentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-red-50 bg-red-50/20 hover:bg-red-50/40 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {normalizeDateOnly(session.startDate)}
                    </span>
                    <span className="font-mono font-bold text-[#7F1D1D] text-xs">
                      {session.durationFormatted}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {session.startDate.slice(11, 16) || '00:00'} – {session.endDate.slice(11, 16) || '00:00'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Sebagai: <strong className="text-slate-600">{session.role}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. BAGIAN INFORMASI-INFORMASI & STATUS OPERASIONAL RUMAH SAKIT */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#9E1B21]" />
          <h2 className="text-lg font-bold text-slate-900">
            Informasi, Pengumuman & Operasional Medis
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Kolom 1 & 2: Papan Pengumuman & Regulasi Medis */}
          <div className="lg:col-span-2 space-y-4">
            {/* Kartu Bulletin Penting */}
            <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-red-50 pb-3">
                <span className="px-2.5 py-1 rounded-md bg-red-100 text-[#7F1D1D] text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9E1B21]" />
                  Pengumuman Resmi Paramedic
                </span>
                <span className="text-[11px] text-slate-400">
                  Update: {getCurrentDateStr()}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Kebijakan Target Jam Duty & Sistem Penggajian Terintegrasi
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Seluruh staf medis diharapkan memenuhi target jam kerja mingguan sesuai jenjang jabatan masing-masing. Staf yang mencapai target jam duty berhak mendapatkan <strong>Gaji Utuh</strong> serta <strong>Bonus Tambahan</strong> untuk setiap kelebihan jam duty. Sistem rekapitulasi absensi dan slip gaji kini tersinkronisasi secara real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Target Jam Duty Mingguan:
                  </span>
                  <p className="text-xs text-slate-500">
                    Jabatan Anda ({currentUser.role}): <strong>{targetWeeklyHours} Jam/Minggu</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Sistem Bonus Kelebihan Jam:
                  </span>
                  <p className="text-xs text-slate-500">
                    Setiap kelipatan <strong>{userRoleCfg?.bonusStepHours ?? 2} Jam</strong> di atas target: bonus <strong>${userRoleCfg?.bonusPerStepAmount ?? 500}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Regulasi Terkini Rumah Sakit dari Database */}
            {regulations && regulations.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#9E1B21]" />
                    Regulasi & SOP Aktif Rumah Sakit
                  </h3>
                  {onNavigateRoute && (
                    <button
                      onClick={() => onNavigateRoute('sop-medis')}
                      className="text-xs font-bold text-[#9E1B21] hover:underline cursor-pointer"
                    >
                      Buka Semua SOP →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {regulations.slice(0, 2).map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3.5 rounded-xl border border-red-50 bg-slate-50/50 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-[#7F1D1D] text-[10px] font-bold">
                          {reg.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{reg.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{reg.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Oleh: {reg.updatedBy} · {reg.updatedAt.slice(0, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kolom 3: Status Operasional Hari Ini & Jadwal Dokter */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#9E1B21]" />
                Status Operasional Medis
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-red-50/40 border border-red-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#9E1B21]" />
                    <span className="text-xs font-semibold text-slate-700">Tenaga Medis Aktif</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {activeStaffCount} Orang
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
                    <span className="text-xs font-semibold text-slate-700">Dokter Siaga Bertugas</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {availableDoctors.length} Dokter
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-700">Status Rekrutmen</span>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                      recruitmentStatus === 'OPEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {recruitmentStatus === 'OPEN' ? 'DIBUKA' : 'DITUTUP'}
                  </span>
                </div>
              </div>

              {/* Daftar Dokter Jaga Hari Ini */}
              <div className="border-t border-red-50 pt-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dokter Jaga Tersedia:
                </span>
                {availableDoctors.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Belum ada jadwal dokter jaga berstatus available.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {availableDoctors.slice(0, 4).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate">{doc.doctorName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-600 shrink-0">
                          {doc.startTime} - {doc.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. BAGIAN LEADERBOARD MINGGUAN DAN BULANAN                     */}
      {/* ============================================================== */}
      <section className="space-y-5">
        {/* Header Leaderboard & Switcher Tab */}
        <div className="p-6 rounded-2xl bg-white border border-red-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-[#9E1B21]" />
              <h2 className="text-xl font-bold text-slate-900">
                Leaderboard Jam Duty Paramedic Kota Baru
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Peringkat jam kerja & keaktifan tenaga medis. Terintegrasi penuh dengan log absensi realtime.
            </p>
          </div>

          {/* Toggle Tab: Mingguan vs Bulanan */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-red-50/50 rounded-2xl border border-red-100">
              <button
                type="button"
                onClick={() => setLeaderboardPeriod('weekly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  leaderboardPeriod === 'weekly'
                    ? 'bg-[#9E1B21] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Leaderboard Mingguan</span>
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardPeriod('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  leaderboardPeriod === 'monthly'
                    ? 'bg-[#9E1B21] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Leaderboard Bulanan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar (Minggu / Bulan Selector & Search) */}
        <div className="p-4 rounded-2xl bg-white border border-red-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {leaderboardPeriod === 'weekly' ? (
            /* Weekly Controls */
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Periode Minggu:</span>
              <button
                type="button"
                onClick={() => setSelectedWeekMonday((cur) => shiftWeekMonday(cur, -1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Minggu Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedWeekMonday(currentRunningMonday)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedWeekMonday === currentRunningMonday
                    ? 'bg-[#9E1B21] text-white border-[#9E1B21]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Minggu Berjalan
              </button>
              <button
                type="button"
                onClick={() => setSelectedWeekMonday((cur) => shiftWeekMonday(cur, 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Minggu Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={selectedWeekMonday}
                onChange={(e) => setSelectedWeekMonday(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#9E1B21]"
              >
                {availableWeeks.map((w) => (
                  <option key={w.mondayStr} value={w.mondayStr}>
                    {w.label} {w.isCurrent ? '(Berjalan)' : ''}
                  </option>
                ))}
              </select>

              <span className="text-xs text-slate-500 font-mono hidden md:inline">
                {formatWeekRangeDisplay(selectedWeekMonday)}
              </span>
            </div>
          ) : (
            /* Monthly Controls */
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Periode Bulan:</span>
              <button
                type="button"
                onClick={() => setSelectedMonth(currentRunningMonth)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedMonth === currentRunningMonth
                    ? 'bg-[#9E1B21] text-white border-[#9E1B21]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Bulan Ini ({formatMonthDisplay(currentRunningMonth)})
              </button>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#9E1B21]"
              />

              <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                {formatMonthDisplay(selectedMonth)}
              </span>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama staff / jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#9E1B21]"
            />
          </div>
        </div>

        {/* Podium Top 3 Juara (#1, #2, #3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topThree.map((item, idx) => {
            const rank = idx + 1;
            const isFirst = rank === 1;
            const isMe = item.staffId === currentUser.id;

            return (
              <div
                key={item.staffId}
                className={`p-6 rounded-3xl border transition relative overflow-hidden flex flex-col justify-between ${
                  isFirst
                    ? 'bg-gradient-to-br from-amber-500/10 via-red-50/40 to-white border-[#9E1B21] shadow-lg ring-1 ring-[#9E1B21]/20'
                    : isMe
                    ? 'bg-gradient-to-br from-red-50 to-white border-red-300 shadow-md ring-1 ring-red-200'
                    : 'bg-white border-red-100 shadow-xs'
                }`}
              >
                {/* Ribbon Juara */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-2xl font-black font-mono tabular-nums ${
                        isFirst
                          ? 'text-[#9E1B21]'
                          : rank === 2
                          ? 'text-[#20C997]'
                          : 'text-amber-600'
                      }`}
                    >
                      #{rank}
                    </span>
                    {isFirst && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-300/40">
                        <Award className="w-3 h-3 text-amber-600" />
                        Juara 1
                      </span>
                    )}
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-md bg-[#9E1B21] text-white text-[10px] font-bold">
                        Akun Anda
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {item.sessions} Sesi Duty
                  </span>
                </div>

                {/* Info Staff */}
                <div className="flex items-center gap-4 my-2">
                  <div className="relative shrink-0">
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`${
                        isFirst ? 'w-16 h-16 sm:w-18 sm:h-18' : 'w-14 h-14'
                      } rounded-2xl object-cover border-2 ${
                        isFirst ? 'border-[#9E1B21]' : isMe ? 'border-red-300' : 'border-slate-200'
                      } shrink-0 bg-white shadow-xs`}
                    />
                    {isFirst && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-xs border border-white">
                        👑
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base font-extrabold text-slate-900 truncate flex items-center gap-1">
                      <span>{item.name}</span>
                      {isMe && <span className="text-[#9E1B21] text-xs font-bold shrink-0">(Anda)</span>}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {item.role} (Lv.{item.level})
                    </p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black font-mono text-[#7F1D1D] tabular-nums">
                        {formatHoursMinutes(item.totalMinutes)}
                      </span>
                      <span className="text-[11px] text-slate-400">total jam</span>
                    </div>
                  </div>
                </div>

                {/* Progress terhadap Target */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Target: {item.targetHours} Jam
                  </span>
                  {item.totalMinutes / 60 >= item.targetHours ? (
                    <span className="text-[#20C997] font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Tercapai
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      {((item.totalMinutes / 60 / (item.targetHours || 1)) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabel Lengkap Peringkat #4 dan Seterusnya (Dengan Highlight Akun Anda) */}
        <div className="bg-white rounded-3xl border border-red-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peringkat Lengkap Seluruh Tenaga Medis Aktif
              </h3>
              <p className="text-xs text-slate-500">
                Baris akun Anda di-highlight secara khusus agar posisi kerja mudah dipantau.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: {filteredLeaderboard.length} Anggota Medis
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-red-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Staff Medis</th>
                  <th className="py-3.5 px-4">Jabatan</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Sesi</th>
                  <th className="py-3.5 px-4 text-right">Total Jam Duty</th>
                  <th className="py-3.5 px-4 text-center">Status Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50 text-xs">
                {restRanking.map((item, idx) => {
                  const rank = idx + 4;
                  const isMe = item.staffId === currentUser.id;
                  const hours = Number((item.totalMinutes / 60).toFixed(2));
                  const isTargetMet = hours >= item.targetHours;

                  return (
                    <tr
                      key={item.staffId}
                      className={`transition ${
                        isMe
                          ? 'bg-red-50/80 font-semibold border-l-4 border-l-[#9E1B21]'
                          : 'hover:bg-red-50/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-500 tabular-nums">
                        #{rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {item.name}
                            </span>
                            {isMe && (
                              <span className="inline-block px-1.5 py-0.2 rounded bg-[#9E1B21] text-white text-[9px] font-extrabold uppercase">
                                Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.role} (Lv.{item.level})
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                        {item.sessions} sesi
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#7F1D1D] tabular-nums text-sm">
                        {formatHoursMinutes(item.totalMinutes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isTargetMet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Target Terpenuhi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {((hours / (item.targetHours || 1)) * 100).toFixed(0)}% ({hours}/{item.targetHours}j)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
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

  // Realtime default: Senin dari minggu yang sedang berjalan saat ini
  const [selectedWeekMonday, setSelectedWeekMonday] = useState<string>(() => getMondayOfDate(new Date()));
  const [slipFilterMode, setSlipFilterMode] = useState<'selected' | 'all'>('selected');

  if (!currentUser) return null;

  const myRoleConfig = roleSalaryConfigs.find((c) => c.role === currentUser.role);
  const periodLabel = formatWeekRangeDisplay(selectedWeekMonday);
  const isCurrentWeek = selectedWeekMonday === getMondayOfDate(new Date());

  const myPayrolls = payrollRecords.filter(
    (p) => p.staffId === currentUser.id || p.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
  );

  const availableWeeks = getAvailableWeeksList(
    dutyLogs
      .filter((l) => l.staffId === currentUser.id || l.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
      .map((l) => l.startDate),
    myPayrolls.map((p) => p.weekKey || '')
  );

  // Filter contributing logs strictly for the selected week
  const myWeeklyDutyLogs = dutyLogs.filter(
    (l) =>
      (l.staffId === currentUser.id ||
        l.staffName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) &&
      isDateInWeek(l.startDate, selectedWeekMonday)
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

  // Slip matching the selected week
  const selectedWeekSlip = myPayrolls.find(
    (p) =>
      p.weekKey === selectedWeekMonday ||
      p.period === periodLabel ||
      p.period.includes(selectedWeekMonday)
  );

  const displayedPayrolls =
    slipFilterMode === 'all'
      ? myPayrolls
      : selectedWeekSlip
      ? [selectedWeekSlip]
      : [];

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

      {/* Week Selection & Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-red-50/70 px-3 py-1.5 rounded-xl border border-red-100">
            <Calendar className="w-3.5 h-3.5 text-[#9E1B21]" />
            <span className="text-[11px] font-bold text-slate-700">Pilih Periode Minggu:</span>
            <select
              value={selectedWeekMonday}
              onChange={(e) => setSelectedWeekMonday(e.target.value)}
              className="text-xs font-bold text-[#7F1D1D] bg-transparent focus:outline-none cursor-pointer"
            >
              {availableWeeks.map((w) => (
                <option key={w.mondayStr} value={w.mondayStr}>
                  {w.isCurrent ? `★ Minggu Ini (${w.label})` : w.label}
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedWeekMonday((prev) => shiftWeekMonday(prev, -1))}
              title="Minggu Sebelumnya"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedWeekMonday(getMondayOfDate(new Date()))}
              title="Kembali ke Minggu Berjalan"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                isCurrentWeek ? 'bg-[#9E1B21] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Minggu Berjalan
            </button>
            <button
              type="button"
              onClick={() => setSelectedWeekMonday((prev) => shiftWeekMonday(prev, 1))}
              title="Minggu Berikutnya"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white cursor-pointer transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Pilih Tgl:</span>
            <input
              type="date"
              value={selectedWeekMonday}
              onChange={(e) => {
                if (e.target.value) setSelectedWeekMonday(getMondayOfDate(e.target.value));
              }}
              className="text-xs font-mono font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              title="Pilih tanggal apapun untuk memantau slip gaji minggu tersebut"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#9E1B21]/10 text-[#9E1B21] border border-[#9E1B21]/20">
            Periode: {periodLabel}
          </span>
          {isCurrentWeek ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Realtime Minggu Berjalan
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Riwayat Minggu Lampau
            </span>
          )}
        </div>
      </div>

      {/* Kartu Kalkulasi Jam Duty Minggu Berjalan */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#9E1B21] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              STATUS JAM KERJA & KALKULASI GAJI ({periodLabel})
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Slip Gaji Resmi</h3>
            <p className="text-xs text-slate-500">
              Slip gaji yang telah diverifikasi dan diterbitkan resmi oleh Bagian Keuangan / HRD RS Kota Baru.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSlipFilterMode('selected')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  slipFilterMode === 'selected'
                    ? 'bg-[#9E1B21] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Slip Periode Ini ({periodLabel})
              </button>
              <button
                type="button"
                onClick={() => setSlipFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  slipFilterMode === 'all'
                    ? 'bg-[#9E1B21] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Riwayat ({myPayrolls.length})
              </button>
            </div>
          </div>
        </div>

        {displayedPayrolls.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-red-100 text-center space-y-3 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">
              {slipFilterMode === 'selected'
                ? `Slip gaji resmi untuk periode ${periodLabel} belum diterbitkan oleh HRD/Keuangan.`
                : 'Belum ada catatan slip gaji resmi yang diterbitkan untuk akun Anda.'}
            </p>
            <p className="text-xs text-slate-500">
              Estimasi take home pay Anda sebesar{' '}
              <strong className="text-emerald-700 font-mono">${estimatedTakeHome.toLocaleString()}</strong>{' '}
              telah terkalkulasi dari jam duty minggu ini di atas.
            </p>
            {slipFilterMode === 'selected' && myPayrolls.length > 0 && (
              <button
                type="button"
                onClick={() => setSlipFilterMode('all')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <span>Lihat {myPayrolls.length} Slip Dari Minggu-Minggu Sebelumnya</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedPayrolls.map((pay) => (
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
