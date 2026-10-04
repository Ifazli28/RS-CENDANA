import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicPortal } from './components/PublicPortal';
import { AuthPortal } from './components/AuthPortal';
import { StaffDashboard, StaffRouteId } from './components/StaffDashboard';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-pink-100 shadow-lg transition-all"
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#20C997] shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-[#E83E8C] shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900">{t.title}</p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const MainRouter: React.FC = () => {
  const { currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'public' | 'auth' | 'dashboard'>('public');
  const [staffRoute, setStaffRoute] = useState<StaffRouteId>('dashboard');

  return (
    <>
      {viewMode === 'public' && (
        <PublicPortal
          onNavigateAuth={() => setViewMode('auth')}
          onNavigateDashboard={() => setViewMode('dashboard')}
        />
      )}

      {viewMode === 'auth' && (
        <AuthPortal
          onBackPublic={() => setViewMode('public')}
          onLoginSuccess={() => {
            setStaffRoute('dashboard');
            setViewMode('dashboard');
          }}
        />
      )}

      {viewMode === 'dashboard' &&
        (currentUser ? (
          <StaffDashboard
            activeRoute={staffRoute}
            onNavigateRoute={setStaffRoute}
            onBackPublic={() => setViewMode('public')}
          />
        ) : (
          <AuthPortal
            onBackPublic={() => setViewMode('public')}
            onLoginSuccess={() => {
              setStaffRoute('dashboard');
              setViewMode('dashboard');
            }}
          />
        ))}

      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
