import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogoRSCendana } from './BrandAssets';
import {
  LogIn,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface AuthPortalProps {
  onBackPublic: () => void;
  onLoginSuccess: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onBackPublic, onLoginSuccess }) => {
  const { login, registerAccount, staffAccounts, addToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Register State (Sec 34 — No Citizen ID, No Pilih Staff, No Pilih Role, No Pilih Rumah Sakit)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Real-time Password Rules Validation (Sec 34)
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirm;
  const isPasswordValid = hasUpper && hasLower && hasNumber && hasSymbol && passwordsMatch;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    const res = login(email, password);
    if (!res.success) {
      setAuthError(res.message);
    } else {
      onLoginSuccess();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!isPasswordValid) {
      setAuthError('Password belum memenuhi persyaratan keamanan atau konfirmasi tidak sama.');
      return;
    }
    const res = registerAccount(regName, regEmail, regPassword);
    if (!res.success) {
      setAuthError(res.message);
    } else {
      setAuthSuccessMsg(
        'Akun Anda berhasil didaftarkan dengan status Pending Approval. Akun Anda masih menunggu persetujuan administrator sebelum dapat digunakan login.'
      );
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirm('');
      setMode('login');
    }
  };

  const quickFillDemo = (demoEmail: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword('Password1!');
    setAuthError('');
    setAuthSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-[#FFF5F8] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        <button
          onClick={onBackPublic}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#E83E8C] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Publik</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-pink-100 shadow-lg overflow-hidden">
          {/* Left Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <LogoRSCendana className="w-12 h-12 shrink-0" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Portal Internal Staff Cendana</h1>
                <p className="text-xs text-slate-500">
                  Sistem Otentikasi Terpadu & Role-Based Access Control
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-800">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Akses Ditolak</p>
                  <p>{authError}</p>
                </div>
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs sm:text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Status Akun: Pending Approval</p>
                  <p>{authSuccessMsg}</p>
                </div>
              </div>
            )}

            {/* LOGIN FORM (Sec 33) */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@cendana.med"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#E83E8C] rounded"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="font-semibold text-[#D63384] hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white font-bold text-sm shadow-sm hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>LOGIN</span>
                </button>

                {/* Panel Register (Sec 33) */}
                <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Belum Punya Akun?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError('');
                      setAuthSuccessMsg('');
                      setMode('register');
                    }}
                    className="px-4 py-2 rounded-xl border border-pink-200 bg-[#FFF5F8] text-[#D63384] text-xs font-bold hover:bg-pink-100 transition cursor-pointer"
                  >
                    DAFTAR SEKARANG
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM (Sec 34) */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    required
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@cendana.med"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <input
                      required
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Buat password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      required
                      type="password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      placeholder="Ulangi password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Real-Time Password Validation Checklist (Sec 34) */}
                <div className="p-3.5 rounded-xl bg-[#FFF5F8] border border-pink-100 space-y-1.5 text-xs">
                  <p className="font-semibold text-slate-700">Validasi Keamanan Password Real-time:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <span className={hasUpper ? 'text-[#20C997] font-semibold' : 'text-slate-500'}>
                      {hasUpper ? '✓' : '○'} Minimal 1 huruf besar (Uppercase)
                    </span>
                    <span className={hasLower ? 'text-[#20C997] font-semibold' : 'text-slate-500'}>
                      {hasLower ? '✓' : '○'} Minimal 1 huruf kecil (Lowercase)
                    </span>
                    <span className={hasNumber ? 'text-[#20C997] font-semibold' : 'text-slate-500'}>
                      {hasNumber ? '✓' : '○'} Minimal 1 angka (Number)
                    </span>
                    <span className={hasSymbol ? 'text-[#20C997] font-semibold' : 'text-slate-500'}>
                      {hasSymbol ? '✓' : '○'} Minimal 1 simbol (!@#$%^&*)
                    </span>
                    <span className={passwordsMatch ? 'text-[#20C997] font-semibold' : 'text-slate-500'}>
                      {passwordsMatch ? '✓' : '○'} Konfirmasi password cocok
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isPasswordValid}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white font-bold text-sm shadow-sm hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>DAFTAR AKUN STAFF (PENDING APPROVAL)</span>
                </button>

                <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Sudah memiliki akun aktif?</span>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-[#D63384] hover:underline cursor-pointer"
                  >
                    Kembali ke Login
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addToast(
                    'info',
                    'Permintaan Reset Dikirim',
                    `Instruksi pemulihan password untuk ${forgotEmail} telah diteruskan ke Heads of Departments.`
                  );
                  setMode('login');
                }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <KeyRound className="w-4 h-4 text-[#E83E8C]" />
                  <span>Pemulihan Password Akun Staff</span>
                </div>
                <input
                  required
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Masukkan email terdaftar Anda"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-bold cursor-pointer"
                  >
                    Kirim Permintaan Reset
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Demo Account Switcher Panel (Sec 77 & 78 — Test All Roles & Account Statuses) */}
          <div className="lg:col-span-5 bg-[#FFF5F8] border-t lg:border-t-0 lg:border-l border-pink-100 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">
                Uji Coba Akun Demo & Hirarki RBAC (Level 1–10)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Klik salah satu akun di bawah untuk mengisi kredensial otomatis dan menguji perbedaan menu sidebar, route guard, serta fitur manajemen sesuai level jabatan:
              </p>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {staffAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => quickFillDemo(acc.email)}
                    className="w-full p-2.5 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C] text-left transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Lv.{acc.level} {acc.role} · {acc.email}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        acc.status === 'Active'
                          ? 'bg-emerald-50 text-[#20C997]'
                          : acc.status === 'Pending Approval'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-pink-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Password Default Seluruh Akun Demo:</p>
              <p className="font-mono text-xs text-[#D63384] font-bold">Password1!</p>
              <p>
                Coba klik akun berstatus <strong>Pending Approval</strong> untuk memverifikasi bahwa akun baru tidak dapat login sebelum disetujui Heads+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
