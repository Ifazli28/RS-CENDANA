import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicPortal } from './components/PublicPortal';
import { AuthPortal } from './components/AuthPortal';
import { StaffDashboard, StaffRouteId } from './components/StaffDashboard';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Trash2 } from 'lucide-react';

const GlobalConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useApp();
  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeConfirmModal}
    >
      <div
        className="bg-white rounded-2xl border border-red-200 p-6 max-w-md w-full space-y-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 mt-0.5">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900">{confirmModal.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              const action = confirmModal.onConfirm;
              closeConfirmModal();
              try {
                action();
              } catch (err) {
                console.error('Gagal menjalankan aksi hapus:', err);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9E1B21] to-[#7F1D1D] hover:opacity-95 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmModal.confirmLabel || 'Ya, Hapus Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-red-100 shadow-lg transition-all"
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#20C997] shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-[#9E1B21] shrink-0 mt-0.5" />}
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

      <GlobalConfirmModal />
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
