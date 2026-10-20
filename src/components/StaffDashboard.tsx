import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogoRSKotaBaru, LogoKotaBaruRoleplay } from './BrandAssets';
import {
  DashboardLeaderboardView,
  StaffProfileView,
  StaffDirectoryView,
  VotingView,
  MySalaryView,
  LeaveAndResignView,
  SOPMedisView,
} from './dashboard/GeneralStaffViews';
import {
  SKSResultsView,
  PsychologyResultsView,
  ColorBlindResultsView,
  PlasticSurgeryDataView,
  AppointmentsDataView,
  DoctorScheduleManageView,
  CharacterKillListView,
} from './dashboard/MedicalDataViews';
import {
  StaffManagementView,
  AccountApprovalView,
  AccountManagementView,
  LeaveAndResignApprovalView,
  RecruitmentAndComplaintManageView,
} from './dashboard/ManagementViewsPart1';
import {
  DutyManagementView,
  WeeklyAttendanceRecapView,
  MonthlyAttendanceRecapView,
  PayrollManagementView,
  RegulationManagementView,
} from './dashboard/ManagementViewsPart2';
import { SKWBBenefitView } from './dashboard/SKWBBenefitView';
import {
  LayoutDashboard,
  User,
  Users,
  FileText,
  Brain,
  Eye,
  Calendar,
  Stethoscope,
  Vote,
  DollarSign,
  Umbrella,
  UserMinus,
  BookOpen,
  UserCog,
  UserCheck,
  KeyRound,
  CheckSquare,
  UserPlus,
  MessageSquareWarning,
  Clock,
  CreditCard,
  ShieldCheck,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

export type StaffRouteId =
  | 'dashboard'
  | 'profile'
  | 'staff-directory'
  | 'daftar-kematian'
  | 'benefit-skwb'
  | 'sks-results'
  | 'psychology-results'
  | 'color-blind-results'
  | 'plastic-surgery-requests'
  | 'appointments-data'
  | 'doctor-schedules'
  | 'voting'
  | 'my-salary'
  | 'leave-request'
  | 'resign-request'
  | 'sop-medis'
  | 'staff-management'
  | 'account-approval'
  | 'account-management'
  | 'leave-approval'
  | 'resign-approval'
  | 'recruitment-management'
  | 'complaint-management'
  | 'duty-management'
  | 'weekly-attendance-recap'
  | 'monthly-attendance-recap'
  | 'payroll-management'
  | 'regulation-management';

interface MenuItemConfig {
  id: StaffRouteId;
  label: string;
  minLevel: number;
  category: 'Utama & Pribadi' | 'Rekam & Layanan Medis' | 'Manajemen & Approval (HRD+)';
  icon: React.FC<{ className?: string }>;
  badgeCount?: number;
}

interface StaffDashboardProps {
  activeRoute: StaffRouteId;
  onNavigateRoute: (route: StaffRouteId) => void;
  onBackPublic: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  activeRoute,
  onNavigateRoute,
  onBackPublic,
}) => {
  const {
    currentUser,
    logout,
    staffAccounts,
    leaveRequests,
    resignRequests,
    switchDemoRole,
  } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return null;

  const pendingAccountsCount = staffAccounts.filter((s) => s.status === 'Pending Approval').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Pending').length;
  const pendingResignsCount = resignRequests.filter((r) => r.status === 'Pending').length;

  const ALL_MENU_ITEMS: MenuItemConfig[] = [
    // Level 1+: Semua Staff Aktif
    { id: 'dashboard', label: 'Dashboard & Leaderboard', minLevel: 1, category: 'Utama & Pribadi', icon: LayoutDashboard },
    { id: 'profile', label: 'Profil & Keamanan', minLevel: 1, category: 'Utama & Pribadi', icon: User },
    { id: 'staff-directory', label: 'Anggota Staff', minLevel: 1, category: 'Utama & Pribadi', icon: Users },
    { id: 'voting', label: 'Voting Internal', minLevel: 1, category: 'Utama & Pribadi', icon: Vote },
    { id: 'my-salary', label: 'Gaji Saya', minLevel: 1, category: 'Utama & Pribadi', icon: DollarSign },
    { id: 'leave-request', label: 'Pengajuan Cuti', minLevel: 1, category: 'Utama & Pribadi', icon: Umbrella },
    { id: 'resign-request', label: 'Pengajuan Resign', minLevel: 1, category: 'Utama & Pribadi', icon: UserMinus },
    { id: 'sop-medis', label: 'SOP Medis', minLevel: 1, category: 'Utama & Pribadi', icon: BookOpen },

    // Level 1+ (Semua Role): Daftar Kematian
    { id: 'daftar-kematian', label: 'Daftar Kematian', minLevel: 1, category: 'Rekam & Layanan Medis', icon: HeartPulse },
    // Level 3+ (Nurse+): Benefit SKWB & SKS
    { id: 'benefit-skwb', label: 'Benefit SKWB', minLevel: 3, category: 'Rekam & Layanan Medis', icon: ShieldCheck },
    { id: 'sks-results', label: 'Hasil Surat Keterangan Sehat', minLevel: 3, category: 'Rekam & Layanan Medis', icon: FileText },
    // Level 4+ (Co-ass+): Psikologi
    { id: 'psychology-results', label: 'Hasil Tes Psikologi', minLevel: 4, category: 'Rekam & Layanan Medis', icon: Brain },
    // Level 5+ (Pharmacist+): Buta Warna, Janji Temu
    { id: 'color-blind-results', label: 'Hasil Tes Buta Warna', minLevel: 5, category: 'Rekam & Layanan Medis', icon: Eye },
    { id: 'appointments-data', label: 'Data Janji Temu', minLevel: 5, category: 'Rekam & Layanan Medis', icon: Calendar },
    // Level 6+ (Doctor+): Operasi Plastik, Jadwal Dokter
    { id: 'plastic-surgery-requests', label: 'Pengajuan Operasi Plastik', minLevel: 6, category: 'Rekam & Layanan Medis', icon: Sparkles },
    { id: 'doctor-schedules', label: 'Jadwal Praktik Dokter', minLevel: 6, category: 'Rekam & Layanan Medis', icon: Stethoscope },

    // Level 8+ (Human Resources Department ke atas): Management & Approvals
    { id: 'staff-management', label: 'Pengelolaan Staff', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: UserCog },
    {
      id: 'account-approval',
      label: 'Approval Akun',
      minLevel: 8,
      category: 'Manajemen & Approval (HRD+)',
      icon: UserCheck,
      badgeCount: pendingAccountsCount,
    },
    { id: 'account-management', label: 'Kelola Akun', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: KeyRound },
    {
      id: 'leave-approval',
      label: 'Approval Cuti',
      minLevel: 8,
      category: 'Manajemen & Approval (HRD+)',
      icon: CheckSquare,
      badgeCount: pendingLeavesCount,
    },
    {
      id: 'resign-approval',
      label: 'Approval Resign',
      minLevel: 8,
      category: 'Manajemen & Approval (HRD+)',
      icon: UserMinus,
      badgeCount: pendingResignsCount,
    },
    { id: 'recruitment-management', label: 'Recruitment Management', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: UserPlus },
    { id: 'complaint-management', label: 'Complaint Management', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: MessageSquareWarning },
    { id: 'duty-management', label: 'Discord Duty Parser', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: Clock },
    { id: 'weekly-attendance-recap', label: 'Rekap Absensi Mingguan', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: Calendar },
    { id: 'monthly-attendance-recap', label: 'Rekap Absensi Bulanan', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: FileText },
    { id: 'payroll-management', label: 'Payroll Management', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: CreditCard },
    { id: 'regulation-management', label: 'Regulation Management', minLevel: 8, category: 'Manajemen & Approval (HRD+)', icon: ShieldCheck },
  ];

  // CRITICAL RBAC RULE SEC 10: Only display menu items that the current user's role level has access to!
  const allowedMenuItems = ALL_MENU_ITEMS.filter((item) => currentUser.level >= item.minLevel);

  const currentRouteConfig = ALL_MENU_ITEMS.find((item) => item.id === activeRoute);
  const hasPermissionForCurrentRoute =
    currentRouteConfig ? currentUser.level >= currentRouteConfig.minLevel : true;

  const categories = Array.from(new Set(allowedMenuItems.map((i) => i.category)));

  const renderContent = () => {
    // CRITICAL RBAC RULE SEC 10: If user opens a route/URL manually without permission, display exact message
    if (!hasPermissionForCurrentRoute) {
      return (
        <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center max-w-lg mx-auto my-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Anda tidak memiliki akses ke halaman ini.
          </h2>
          <p className="text-xs text-slate-500">
            Jabatan Anda saat ini adalah <strong>{currentUser.role} (Level {currentUser.level})</strong>, sedangkan modul <strong>{currentRouteConfig?.label}</strong> membutuhkan minimal Level {currentRouteConfig?.minLevel}.
          </p>
          <button
            onClick={() => onNavigateRoute('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white text-xs font-semibold cursor-pointer"
          >
            Kembali ke Dashboard Utama
          </button>
        </div>
      );
    }

    switch (activeRoute) {
      case 'dashboard':
        return <DashboardLeaderboardView />;
      case 'profile':
        return <StaffProfileView />;
      case 'staff-directory':
        return <StaffDirectoryView />;
      case 'voting':
        return <VotingView />;
      case 'my-salary':
        return <MySalaryView />;
      case 'leave-request':
        return <LeaveAndResignView mode="leave" />;
      case 'resign-request':
        return <LeaveAndResignView mode="resign" />;
      case 'sop-medis':
        return <SOPMedisView />;
      case 'daftar-kematian':
        return <CharacterKillListView />;
      case 'benefit-skwb':
        return <SKWBBenefitView />;
      case 'sks-results':
        return <SKSResultsView />;
      case 'psychology-results':
        return <PsychologyResultsView />;
      case 'plastic-surgery-requests':
        return <PlasticSurgeryDataView />;
      case 'color-blind-results':
        return <ColorBlindResultsView />;
      case 'appointments-data':
        return <AppointmentsDataView />;
      case 'doctor-schedules':
        return <DoctorScheduleManageView />;
      case 'staff-management':
        return <StaffManagementView />;
      case 'account-approval':
        return <AccountApprovalView />;
      case 'account-management':
        return <AccountManagementView />;
      case 'leave-approval':
        return <LeaveAndResignApprovalView mode="leave" />;
      case 'resign-approval':
        return <LeaveAndResignApprovalView mode="resign" />;
      case 'recruitment-management':
        return <RecruitmentAndComplaintManageView mode="recruitment" />;
      case 'complaint-management':
        return <RecruitmentAndComplaintManageView mode="complaint" />;
      case 'duty-management':
        return <DutyManagementView />;
      case 'weekly-attendance-recap':
        return <WeeklyAttendanceRecapView />;
      case 'monthly-attendance-recap':
        return <MonthlyAttendanceRecapView />;
      case 'payroll-management':
        return <PayrollManagementView />;
      case 'regulation-management':
        return <RegulationManagementView />;
      default:
        return <DashboardLeaderboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (Sec 79 — Dynamic based on role level) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-red-100 flex flex-col transition-transform duration-200 no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-red-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <LogoRSKotaBaru className="w-9 h-9 shrink-0 drop-shadow-xs" />
              <LogoKotaBaruRoleplay className="w-8 h-8 shrink-0 drop-shadow-xs" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate">Paramedic Kota Baru</h1>
              <p className="text-[11px] text-[#9E1B21] font-semibold truncate">
                Lv.{currentUser.level} · {currentUser.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-red-50/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Approval Center Quick Summary for HRD & Heads+ (Sec 57) */}
        {currentUser.level >= 8 && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-slate-50 border border-red-200/70 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#7F1D1D]">
              <span>Approval Center</span>
              <span className="font-mono tabular-nums">
                {pendingAccountsCount + pendingLeavesCount + pendingResignsCount} Pending
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600 font-medium">
              <button
                onClick={() => onNavigateRoute('account-approval')}
                className="p-1.5 rounded-lg bg-white hover:border-[#9E1B21] border border-red-100 text-center cursor-pointer"
              >
                Akun: <strong>{pendingAccountsCount}</strong>
              </button>
              <button
                onClick={() => onNavigateRoute('leave-approval')}
                className="p-1.5 rounded-lg bg-white hover:border-[#9E1B21] border border-red-100 text-center cursor-pointer"
              >
                Cuti: <strong>{pendingLeavesCount}</strong>
              </button>
              <button
                onClick={() => onNavigateRoute('resign-approval')}
                className="p-1.5 rounded-lg bg-white hover:border-[#9E1B21] border border-red-100 text-center cursor-pointer"
              >
                Resign: <strong>{pendingResignsCount}</strong>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {cat}
              </p>
              {allowedMenuItems
                .filter((i) => i.category === cat)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigateRoute(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-red-50/70/70 hover:text-[#7F1D1D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                            isActive ? 'bg-white text-[#7F1D1D]' : 'bg-red-100 text-[#7F1D1D]'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-red-100 space-y-2">
          <button
            onClick={onBackPublic}
            className="w-full py-2 px-3 rounded-xl border border-red-200 bg-slate-50 text-[#7F1D1D] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Buka Halaman Publik</span>
          </button>
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Staff</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-red-100 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-red-100 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              <span className="text-xs text-slate-400">Portal Staff / </span>
              <span className="text-sm font-bold text-slate-900">
                {currentRouteConfig?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Current User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateRoute('profile')}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl hover:bg-red-50/70 transition cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover border border-red-200"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-[#20C997] font-semibold mt-0.5">
                  Active · Lv.{currentUser.level}
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
