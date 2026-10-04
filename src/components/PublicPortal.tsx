import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogoRSCendana, LogoKotaCendana } from './BrandAssets';
import { PublicModals, PublicModalType } from './PublicModals';
import { DoctorSchedule } from '../types';
import {
  FileText,
  Calendar,
  Stethoscope,
  ShieldCheck,
  MessageSquareWarning,
  Brain,
  Eye,
  Sparkles,
  Award,
  Layers,
  HeartHandshake,
  Activity,
  Clock,
  Upload,
  Menu,
  X,
  ArrowRight,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface PublicPortalProps {
  onNavigateAuth: () => void;
  onNavigateDashboard: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onNavigateAuth,
  onNavigateDashboard,
}) => {
  const { currentUser, submitComplaint, addToast } = useApp();
  const [activeModal, setActiveModal] = useState<PublicModalType>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchedule | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Complaint Form State (Sec 27)
  const [complaintType, setComplaintType] = useState<'Laporan / Keluhan' | 'Masukan / Saran'>(
    'Laporan / Keluhan'
  );
  const [reporterName, setReporterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [subject, setSubject] = useState('');
  const [chronology, setChronology] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitComplaint({
      type: complaintType,
      reporterName: isAnonymous || !reporterName.trim() ? 'Anonim' : reporterName.trim(),
      isAnonymous: isAnonymous || !reporterName.trim(),
      subject: subject.trim(),
      chronology: chronology.trim(),
      attachmentName: attachmentName || undefined,
    });
    setReporterName('');
    setIsAnonymous(false);
    setSubject('');
    setChronology('');
    setAttachmentName('');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F8] text-slate-800">
      {/* 1. HEADER / NAVBAR (Sec 12) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Lockup */}
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <LogoRSCendana className="w-11 h-11 shrink-0" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
              Portal Layanan Paramedic Cendana
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('layanan-medis')}
              className="hover:text-[#E83E8C] transition cursor-pointer whitespace-nowrap"
            >
              Layanan Medis
            </button>
            <button
              onClick={() => setActiveModal('doctor_schedule')}
              className="hover:text-[#E83E8C] transition cursor-pointer whitespace-nowrap"
            >
              Jadwal Dokter
            </button>
            <button
              onClick={() => setActiveModal('regulation')}
              className="hover:text-[#E83E8C] transition cursor-pointer whitespace-nowrap"
            >
              Regulasi Pengobatan
            </button>
            <button
              onClick={() => scrollToSection('keluhan-warga')}
              className="hover:text-[#E83E8C] transition cursor-pointer whitespace-nowrap"
            >
              Keluhan Warga
            </button>
          </nav>

          {/* Primary Actions: Recruitment Paramedic & Login Staff */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setActiveModal('recruitment')}
              className="px-4 py-2 rounded-xl border border-pink-200 bg-[#FFF5F8] text-[#D63384] hover:bg-pink-100/70 text-xs font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Recruitment Paramedic</span>
            </button>

            {currentUser ? (
              <button
                onClick={onNavigateDashboard}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Dashboard Staff ({currentUser.role})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onNavigateAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Staff</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="md:hidden p-2 rounded-xl border border-pink-100 text-slate-700 hover:bg-pink-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-pink-100 px-4 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <button
                onClick={() => scrollToSection('layanan-medis')}
                className="text-left py-2 px-3 rounded-lg hover:bg-pink-50"
              >
                Layanan Medis
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('doctor_schedule');
                }}
                className="text-left py-2 px-3 rounded-lg hover:bg-pink-50"
              >
                Jadwal Dokter
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('regulation');
                }}
                className="text-left py-2 px-3 rounded-lg hover:bg-pink-50"
              >
                Regulasi Pengobatan
              </button>
              <button
                onClick={() => scrollToSection('keluhan-warga')}
                className="text-left py-2 px-3 rounded-lg hover:bg-pink-50"
              >
                Keluhan Warga
              </button>
            </div>
            <div className="pt-2 border-t border-pink-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('recruitment');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-pink-200 bg-[#FFF5F8] text-[#D63384] text-xs font-semibold text-center"
              >
                Recruitment Paramedic
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentUser) onNavigateDashboard();
                  else onNavigateAuth();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold text-center"
              >
                {currentUser ? 'Buka Dashboard Staff' : 'Login Staff'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (Sec 12 & 14 — No hero statistics, no hospital network, no hero photo banner) */}
      <section id="top" className="relative pt-14 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Status & Identity Info from Sec 12 */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-600">
            <span className="font-semibold text-[#D63384]">PELAYANAN TERPADU</span>
            <span aria-hidden="true">·</span>
            <span>Layanan Medis Terpadu Kota Cendana</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-2 font-medium text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20C997] animate-pulse" />
              Unit Gawat Darurat dan Rawat Jalan Siaga
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 py-1">
            <LogoRSCendana className="w-16 h-16 sm:w-20 sm:h-20" />
            <LogoKotaCendana className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Paramedic <span className="text-[#E83E8C]">Cendana</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Dedikasi tanpa henti untuk keselamatan dan kesehatan warga Kota Cendana. Kami menghadirkan respon medis darurat yang cepat, profesional, serta terintegrasi 24/7 demi kenyamanan dan kepastian layanan kesehatan Anda.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => scrollToSection('layanan-medis')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 transition cursor-pointer whitespace-nowrap"
            >
              Jelajahi Layanan Medis →
            </button>
            <button
              onClick={() => setActiveModal('regulation')}
              className="px-6 py-3.5 rounded-xl bg-white border border-pink-200 text-slate-800 hover:border-[#E83E8C] text-sm font-semibold transition cursor-pointer whitespace-nowrap"
            >
              Lihat Regulasi Pengobatan
            </button>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACCESS (Sec 15) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <button
            onClick={() => setActiveModal('sks')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 hover:border-[#E83E8C] shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] group-hover:bg-[#E83E8C] group-hover:text-white flex items-center justify-center transition mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Surat Kesehatan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pengurusan SKS Resmi</p>
          </button>

          <button
            onClick={() => {
              setSelectedDoctor(null);
              setActiveModal('appointment');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 hover:border-[#E83E8C] shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] group-hover:bg-[#E83E8C] group-hover:text-white flex items-center justify-center transition mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Buat Janji Temu</h3>
            <p className="text-xs text-slate-500 mt-0.5">Konsultasi Dokter</p>
          </button>

          <button
            onClick={() => setActiveModal('doctor_schedule')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 hover:border-[#E83E8C] shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#20C997] group-hover:bg-[#20C997] group-hover:text-white flex items-center justify-center transition mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Jadwal Dokter</h3>
            <p className="text-xs text-slate-500 mt-0.5">Praktik Umum & Spesialis</p>
          </button>

          <button
            onClick={() => setActiveModal('regulation')}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 hover:border-[#E83E8C] shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] group-hover:bg-[#E83E8C] group-hover:text-white flex items-center justify-center transition mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Regulasi</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tarif & Benefit SKWB</p>
          </button>

          <button
            onClick={() => scrollToSection('keluhan-warga')}
            className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-pink-100 hover:border-[#E83E8C] shadow-xs hover:shadow-md transition text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] group-hover:bg-[#E83E8C] group-hover:text-white flex items-center justify-center transition mb-3">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Keluhan Warga</h3>
            <p className="text-xs text-slate-500 mt-0.5">Kotak Aspirasi & Saran</p>
          </button>
        </div>
      </section>

      {/* 4. MISSION / VALUE PROPOSITION (Sec 16) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-2xl bg-white border border-pink-100 p-8 sm:p-12 shadow-xs">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-xs font-bold tracking-wider text-[#E83E8C]">
              MISI & KOMITMEN PELAYANAN KOTA CENDANA
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              “Berdedikasi Utuh untuk Keselamatan Anda, Hadir Menjawab Setiap Panggilan Jiwa dengan Penanganan Medis Terdepan dan Sepenuh Hati.”
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
              Paramedic Cendana berkomitmen memberikan standar perawatan tertinggi melalui kecepatan respon, keahlian medis profesional, dan integritas yang dapat Anda percayai kapan saja.
            </p>
          </div>
        </div>
      </section>

      {/* 5. LAYANAN MEDIS KAMI (Sec 17 — Do NOT use label LAYANAN SPESIALIS) */}
      <section id="layanan-medis" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Layanan Medis Kami</h2>
          <p className="text-sm text-slate-600">
            Akses layanan pemeriksaan kesehatan, administrasi surat medis, dan konsultasi dokter secara terintegrasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 01 — Surat Kesehatan */}
          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#E83E8C]">01. Layanan Administrasi</span>
                <FileText className="w-5 h-5 text-[#E83E8C]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">01 — Surat Kesehatan</h3>
              <p className="text-sm text-slate-600">Pengurusan surat keterangan sehat untuk:</p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Pemeriksaan rutin</li>
                <li>Lampiran pembuatan lisensi</li>
                <li>Lampiran melamar pekerjaan</li>
              </ul>
            </div>
            <button
              onClick={() => setActiveModal('sks')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
            >
              Ajukan Surat Kesehatan
            </button>
          </div>

          {/* 02 — Poli Umum & Dokter */}
          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#20C997]">02. Rawat Jalan</span>
                <Stethoscope className="w-5 h-5 text-[#20C997]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">02 — Poli Umum & Dokter</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pemeriksaan umum dokter, diagnosis penyakit, keluhan sakit/flu, dan jadwal temu dokter.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDoctor(null);
                setActiveModal('appointment');
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
            >
              Buat Janji Temu
            </button>
          </div>

          {/* 03 — Operasi Plastik */}
          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#E83E8C]">03. Bedah Estetika</span>
                <Sparkles className="w-5 h-5 text-[#E83E8C]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">03 — Operasi Plastik</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prosedur bedah estetika oleh tim dokter spesialis berpengalaman.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('plastic_surgery')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
            >
              Ajukan Operasi Plastik
            </button>
          </div>

          {/* Banner Paramedic Cendana (Sec 17) */}
          <div className="md:col-span-2 lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <LogoRSCendana className="w-14 h-14 shrink-0 hidden sm:block" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Paramedic Cendana</h3>
                <p className="text-sm text-pink-50 mt-0.5">
                  Tim medis profesional siap melayani kebutuhan Anda.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('doctor_schedule')}
              className="px-6 py-3 rounded-xl bg-white text-[#D63384] text-xs font-bold hover:bg-pink-50 transition cursor-pointer whitespace-nowrap"
            >
              Lihat Jadwal Dokter
            </button>
          </div>

          {/* 04 — Tes Buta Warna */}
          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col justify-between space-y-5 lg:col-span-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#20C997]">04. Diagnostik Visual</span>
                <Eye className="w-5 h-5 text-[#20C997]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">04 — Tes Buta Warna</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Uji penglihatan warna menggunakan metode Ishihara (20 Lempeng Interaktif).
              </p>
            </div>
            <button
              onClick={() => setActiveModal('color_blind')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
            >
              Mulai Tes
            </button>
          </div>

          {/* 05 — Tes Psikologi */}
          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col justify-between space-y-5 md:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#E83E8C]">05. Kesehatan Mental</span>
                <Brain className="w-5 h-5 text-[#E83E8C]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">05 — Tes Psikologi</h3>
              <p className="text-sm text-slate-600">Pemeriksaan dan evaluasi kesehatan mental untuk:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div>• Evaluasi mandiri</div>
                <div>• Pekerjaan / rekrutmen</div>
                <div>• Lisensi / izin khusus</div>
                <div>• Rujukan konsultasi & terapi medis</div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('psychology')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
            >
              Daftar Tes Psikologi
            </button>
          </div>
        </div>
      </section>

      {/* 6. KELUHAN WARGA (Sec 27) */}
      <section id="keluhan-warga" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-pink-100 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Kotak Keluhan & Aspirasi Warga
              </h2>
              <p className="text-sm text-slate-600">
                Layanan penyampaian pengaduan, kritik, dan saran untuk Rumah Sakit Cendana bagi seluruh warga dan pasien (bisa dikirim secara Anonim).
              </p>
            </div>

            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Pengaduan *
                  </label>
                  <select
                    value={complaintType}
                    onChange={(e) =>
                      setComplaintType(e.target.value as 'Laporan / Keluhan' | 'Masukan / Saran')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                  >
                    <option value="Laporan / Keluhan">Laporan / Keluhan</option>
                    <option value="Masukan / Saran">Masukan / Saran</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama Pasien / Warga (Opsional)
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="accent-[#E83E8C] rounded"
                      />
                      <span>Kirim sebagai Anonim</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    value={isAnonymous ? 'Anonim' : reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Kosongkan jika ingin anonim"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subjek / Topik *
                </label>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ringkasan topik laporan atau saran Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detail Kronologi / Isi Keluhan *
                </label>
                <textarea
                  required
                  rows={4}
                  value={chronology}
                  onChange={(e) => setChronology(e.target.value)}
                  placeholder="Tuliskan detail kronologi, waktu kejadian, lokasi, serta pihak terkait..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Bukti (JPG / PNG / GIF — Maks. 5 MB)
                </label>
                <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-pink-200 bg-[#FFF5F8] hover:bg-pink-50 transition cursor-pointer text-xs text-slate-600">
                  <span>{attachmentName || 'Klik untuk melampirkan gambar pendukung (Opsional)'}</span>
                  <Upload className="w-4 h-4 text-[#E83E8C]" />
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 5 * 1024 * 1024) {
                          addToast('error', 'Ukuran File Terlalu Besar', 'Maksimal ukuran lampiran adalah 5 MB.');
                          return;
                        }
                        setAttachmentName(f.name);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white font-semibold text-sm shadow-sm hover:opacity-95 transition cursor-pointer"
                >
                  Kirim Laporan Pengaduan
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 7. MENGAPA MEMILIH KAMI (Sec 28 — Strictly NO photos; cards, icons, typography, 4 exact stats) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Mengapa Memilih Kami</h2>
          <p className="text-sm text-slate-600">
            Standar keunggulan medis Rumah Sakit Cendana yang dibangun di atas kepercayaan warga.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">10+</div>
            <h3 className="text-base font-bold text-slate-900">10+ Tahun Pengalaman</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedikasi panjang melayani gawat darurat, evakuasi taktis, dan perawatan intensif warga Kota Cendana.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#20C997] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">15</div>
            <h3 className="text-base font-bold text-slate-900">15 Bidang Layanan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mencakup IGD, poli umum, bedah plastik rekonstruksi, psikiatri, farmasi, hingga uji diagnostik.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">95%</div>
            <h3 className="text-base font-bold text-slate-900">95% Kepuasan Pasien</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pelayanan humanis, transparan sesuai regulasi resmi, serta terbuka terhadap aspirasi warga.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#20C997] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">98%</div>
            <h3 className="text-base font-bold text-slate-900">98% Akurasi Diagnostik</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Didukung instrumen pengujian klinis terkalibrasi dan tenaga dokter spesialis bersertifikasi.
            </p>
          </div>
        </div>
      </section>

      {/* 8. JAM OPERASIONAL (Sec 29) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white border border-pink-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Jam Operasional Layanan</h2>
              <p className="text-xs text-slate-500">Jadwal pelayanan harian Rumah Sakit Cendana</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#FFF5F8] border border-pink-100 space-y-1">
              <p className="text-xs font-semibold text-slate-500">TINDAKAN BEDAH ESTETIKA</p>
              <h3 className="text-lg font-bold text-slate-900">Operasi Plastik</h3>
              <p className="text-sm font-semibold text-[#D63384] pt-1">Shift 1 & Shift 2</p>
            </div>

            <div className="p-5 rounded-xl bg-[#FFF5F8] border border-pink-100 space-y-1">
              <p className="text-xs font-semibold text-slate-500">ADMINISTRASI & KETERANGAN</p>
              <h3 className="text-lg font-bold text-slate-900">Surat-Suratan Medis</h3>
              <p className="text-sm font-semibold text-[#D63384] pt-1">Shift 1 & Shift 2</p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
              <p className="text-xs font-semibold text-emerald-700">INSTALASI OBAT & IGD</p>
              <h3 className="text-lg font-bold text-slate-900">Layanan Farmasi</h3>
              <p className="text-sm font-bold text-[#20C997] pt-1">Siaga 24 JAM</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION (Sec 30) */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] p-8 sm:p-12 text-white text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-bold">Butuh layanan medis sekarang?</h2>
          <p className="text-sm sm:text-base text-pink-50 max-w-xl mx-auto">
            Pilih layanan pemeriksaan atau tinjau regulasi resmi pengobatan Rumah Sakit Cendana.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('layanan-medis')}
              className="px-6 py-3.5 rounded-xl bg-white text-[#D63384] text-sm font-bold hover:bg-pink-50 transition cursor-pointer whitespace-nowrap"
            >
              Lihat Layanan →
            </button>
            <button
              onClick={() => setActiveModal('regulation')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/25 hover:bg-slate-900/35 border border-white/30 text-white text-sm font-semibold transition cursor-pointer whitespace-nowrap"
            >
              Regulasi Pengobatan 🔒
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER (Sec 31) */}
      <footer className="mt-auto bg-white border-t border-pink-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <LogoRSCendana className="w-12 h-12 shrink-0" />
            <div>
              <span className="text-base font-bold text-slate-900">Paramedic Cendana</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Layanan medis profesional untuk komunitas dan warga Kota Cendana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span>Terpercaya</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#20C997]">24/7</span>
            <span aria-hidden="true">·</span>
            <span>Profesional</span>
          </div>

          <p className="text-xs text-slate-500 text-center md:text-right">
            © 2026 Portal Layanan Paramedic Cendana. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>

      {/* Public Interactive Modals */}
      <PublicModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onOpenModal={(m) => setActiveModal(m)}
        selectedDoctorForAppointment={selectedDoctor}
        onSelectDoctorForAppointment={setSelectedDoctor}
      />
    </div>
  );
};
