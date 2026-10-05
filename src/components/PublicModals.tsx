import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DoctorSchedule, SKSRecord } from '../types';
import { IshiharaTestSection } from './IshiharaTest';
import {
  GHQ12_QUESTIONS,
  DASS21_QUESTIONS,
  evaluateFullPsychologyAssessment,
} from '../utils/psychologyAssessment';
import {
  X,
  FileText,
  Brain,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck,
  Upload,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
} from 'lucide-react';

export type PublicModalType =
  | null
  | 'sks'
  | 'psychology'
  | 'plastic_surgery'
  | 'color_blind'
  | 'doctor_schedule'
  | 'appointment'
  | 'regulation'
  | 'recruitment'
  | 'skwb_claim';

interface PublicModalsProps {
  activeModal: PublicModalType;
  onClose: () => void;
  onOpenModal: (modal: PublicModalType) => void;
  selectedDoctorForAppointment: DoctorSchedule | null;
  onSelectDoctorForAppointment: (doc: DoctorSchedule | null) => void;
}

export const PublicModals: React.FC<PublicModalsProps> = ({
  activeModal,
  onClose,
  onOpenModal,
  selectedDoctorForAppointment,
  onSelectDoctorForAppointment,
}) => {
  const {
    doctorSchedules,
    regulations,
    recruitmentStatus,
    submitSKS,
    submitPsychology,
    submitPlasticSurgery,
    submitAppointment,
    submitRecruitment,
    submitSKWBClaim,
  } = useApp();

  // SKWB Benefit Claim Form State
  const [skwbForm, setSkwbForm] = useState({
    icName: '',
    birthDate: '',
    issueDate: new Date().toISOString().slice(0, 10),
    photoFileName: '',
    photoFileSize: 0,
    photoDataUrl: '',
  });
  const [skwbUploadError, setSkwbUploadError] = useState('');
  const [skwbUploading, setSkwbUploading] = useState(false);
  const [skwbSubmittedClaim, setSkwbSubmittedClaim] = useState<{
    icName: string;
    birthDate: string;
    issueDate: string;
    startDate: string;
    endDate: string;
    status: 'Aktif' | 'Kadaluarsa';
  } | null>(null);

  const handleSKWBImageUpload = (file: File) => {
    setSkwbUploadError('');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setSkwbUploadError('Format file tidak didukung. Harap unggah gambar JPG, JPEG, PNG, atau WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSkwbUploadError('Ukuran file terlalu besar. Maksimal ukuran file foto SKWB adalah 5 MB.');
      return;
    }
    setSkwbUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1100;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setSkwbForm((prev) => ({
            ...prev,
            photoFileName: file.name,
            photoFileSize: file.size,
            photoDataUrl: compressedDataUrl,
          }));
        } else {
          setSkwbForm((prev) => ({
            ...prev,
            photoFileName: file.name,
            photoFileSize: file.size,
            photoDataUrl: String(reader.result || ''),
          }));
        }
        setSkwbUploading(false);
      };
      img.onerror = () => {
        setSkwbUploadError('Gagal memproses gambar. Pastikan file gambar tidak rusak.');
        setSkwbUploading(false);
      };
      img.src = String(reader.result || '');
    };
    reader.onerror = () => {
      setSkwbUploadError('Gagal membaca file gambar.');
      setSkwbUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const computePreviewEndDate = (issueDateStr: string) => {
    if (!issueDateStr) return '-';
    const parts = issueDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return issueDateStr;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() + 7);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // SKS Form State
  const [sksForm, setSksForm] = useState({
    fullName: '',
    birthDate: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    age: '',
    occupation: '',
    phoneOrIC: '',
    purpose: 'Pemeriksaan Rutin' as
      | 'Pemeriksaan Rutin'
      | 'Lampiran Pembuatan Lisensi'
      | 'Lampiran Melamar Pekerjaan',
  });

  // Psychology Form State (Dua Tahap: 1. Isi Data Diri -> 2. Tes & Evaluasi Psikologi [Bagian 1 GHQ-12 & Bagian 2 DASS-21])
  const [psyStep, setPsyStep] = useState<'data_diri' | 'tes_evaluasi' | 'selesai'>('data_diri');
  const [psyForm, setPsyForm] = useState({
    fullName: '',
    birthDate: '',
    age: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    occupation: '',
    phoneOrIC: '',
    purpose: 'Evaluasi Kesehatan Mental Mandiri' as
      | 'Evaluasi Kesehatan Mental Mandiri'
      | 'Syarat Kelayakan Kerja / Rekrutmen'
      | 'Lampiran Pengajuan Lisensi / Izin Khusus'
      | 'Rujukan Konsultasi & Terapi Medis',
    historyNotes: '',
  });
  const [ghqAnswers, setGhqAnswers] = useState<
    Record<number, { code: string; label: string; score: number }>
  >({});
  const [dassAnswers, setDassAnswers] = useState<
    Record<number, { code: string; label: string; score: number }>
  >({});
  const [psyError, setPsyError] = useState('');
  const [psyLastResult, setPsyLastResult] = useState<ReturnType<
    typeof evaluateFullPsychologyAssessment
  > | null>(null);

  // Plastic Surgery Form State
  const [plasticForm, setPlasticForm] = useState({
    fullName: '',
    birthDate: '',
    gender: 'Perempuan' as 'Laki-laki' | 'Perempuan',
    age: '',
    occupation: '',
    phoneOrIC: '',
    surgeryType: 'Rhinoplasty & Facial Contouring/Oplas ($2,500)',
    idPhotoName: '',
    legalDocName: '',
    patientCardPhotoName: '',
  });
  const [plasticUploadError, setPlasticUploadError] = useState('');

  // Doctor Schedule Filter State
  const [scheduleFilter, setScheduleFilter] = useState<string>('Semua');

  // Appointment Form State
  const [aptForm, setAptForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    complaint: '',
  });

  // Recruitment Form State (Recruitment Medis Cendana Roleplay)
  const [recForm, setRecForm] = useState({
    // INFORMASI IC - Persyaratan Umum
    age17Plus: false,
    dedicatedUnderPressure: false,
    willingTraining1To3Days: false,
    willingFollowSOP: false,
    // INFORMASI IC - Syarat IC sebelum interview
    hasKtpIme: false,
    hasSkb: false,
    hasSim: false,
    hasSuratKesehatan: false,
    hasSuratPsikolog: false,
    // CURRICULUM VITAE IC
    fullName: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    birthDateIC: '',
    experience: '',
    motivation: '',
    rpExperienceOOC: '',
    ktpPhotoName: '',
    skbPhotoName: '',
    suratKesehatanPhotoName: '',
    suratPsikologPhotoName: '',
    // INFORMASI OOC
    otherCityResponsibilityOOC: '',
    onlineHoursOOC: '',
    onlineDaysOOC: '',
  });
  const [recError, setRecError] = useState<string>('');
  const [recSubmittedSuccess, setRecSubmittedSuccess] = useState<boolean>(false);

  // Regulation Image Zoom State
  const [regZoom, setRegZoom] = useState<number>(100);

  if (!activeModal) return null;

  const filteredSchedules =
    scheduleFilter === 'Semua'
      ? doctorSchedules
      : doctorSchedules.filter(
          (s) =>
            s.specialty.toLowerCase().includes(scheduleFilter.toLowerCase()) ||
            s.doctorRole.toLowerCase().includes(scheduleFilter.toLowerCase())
        );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-pink-100 shadow-xl p-5 sm:p-8">
        {/* Top Close Bar */}
        <button
          onClick={onClose}
          aria-label="Tutup Modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-[#D63384] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. MODAL SURAT KETERANGAN SEHAT (Sec 18) */}
        {activeModal === 'sks' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Formulir Surat Keterangan Sehat (SKS)</h2>
                <p className="text-xs text-slate-500">
                  Pengurusan resmi SKS RS Cendana · Diverifikasi oleh Paramedic ke atas
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSKS({
                  fullName: sksForm.fullName,
                  birthDate: sksForm.birthDate,
                  gender: sksForm.gender,
                  age: Number(sksForm.age) || 20,
                  occupation: sksForm.occupation,
                  phoneOrIC: sksForm.phoneOrIC,
                  purpose: sksForm.purpose,
                });
                onClose();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  required
                  type="text"
                  value={sksForm.fullName}
                  onChange={(e) => setSksForm({ ...sksForm, fullName: e.target.value })}
                  placeholder="Masukkan nama lengkap sesuai identitas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                <input
                  required
                  type="date"
                  value={sksForm.birthDate}
                  onChange={(e) => setSksForm({ ...sksForm, birthDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={sksForm.gender}
                  onChange={(e) =>
                    setSksForm({ ...sksForm, gender: e.target.value as 'Laki-laki' | 'Perempuan' })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Umur (Tahun) *</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={120}
                  value={sksForm.age}
                  onChange={(e) => setSksForm({ ...sksForm, age: e.target.value })}
                  placeholder="Contoh: 25"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan *</label>
                <input
                  required
                  type="text"
                  value={sksForm.occupation}
                  onChange={(e) => setSksForm({ ...sksForm, occupation: e.target.value })}
                  placeholder="Contoh: Wiraswasta / Mekanik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No HP / IC *</label>
                <input
                  required
                  type="text"
                  value={sksForm.phoneOrIC}
                  onChange={(e) => setSksForm({ ...sksForm, phoneOrIC: e.target.value })}
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keperluan *</label>
                <select
                  value={sksForm.purpose}
                  onChange={(e) =>
                    setSksForm({
                      ...sksForm,
                      purpose: e.target.value as SKSRecord['purpose'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                >
                  <option value="Pemeriksaan Rutin">Pemeriksaan Rutin</option>
                  <option value="Lampiran Pembuatan Lisensi">Lampiran Pembuatan Lisensi</option>
                  <option value="Lampiran Melamar Pekerjaan">Lampiran Melamar Pekerjaan</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                >
                  Kirim Pengajuan SKS
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. MODAL TES & EVALUASI PSIKOLOGI (Dua Form Utama: 1. Isi Data Diri & 2. Tes & Evaluasi Psikologi) */}
        {activeModal === 'psychology' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] text-white flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tes & Evaluasi Psikologi</h2>
                  <p className="text-xs text-slate-500">
                    Kerahasiaan Medis Terjamin · Hasil & Sertifikat dievaluasi oleh Co-ass ke atas di Portal Staff
                  </p>
                </div>
              </div>

              {/* Step Indicator: Form 1 (Isi Data Diri) & Form 2 (Tes & Evaluasi Psikologi) */}
              {psyStep !== 'selesai' && (
                <div className="flex items-center gap-1.5 bg-[#FFF5F8] p-1.5 rounded-xl border border-pink-100 text-xs font-bold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPsyStep('data_diri')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      psyStep === 'data_diri'
                        ? 'bg-[#E83E8C] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#D63384]'
                    }`}
                  >
                    1. Isi Data Diri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !psyForm.fullName.trim() ||
                        !psyForm.birthDate ||
                        !psyForm.age ||
                        !psyForm.occupation.trim() ||
                        !psyForm.phoneOrIC.trim()
                      ) {
                        setPsyError('Harap lengkapi seluruh kolom wajib pada Form Isi Data Diri terlebih dahulu.');
                        return;
                      }
                      setPsyError('');
                      setPsyStep('tes_evaluasi');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      psyStep === 'tes_evaluasi'
                        ? 'bg-[#E83E8C] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-[#D63384]'
                    }`}
                  >
                    2. Tes & Evaluasi Psikologi
                  </button>
                </div>
              )}
            </div>

            {psyError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {psyError}
              </div>
            )}

            {/* FORM UTAMA 1: ISI DATA DIRI */}
            {psyStep === 'data_diri' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPsyError('');
                  setPsyStep('tes_evaluasi');
                }}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-xl bg-[#FFF5F8] border border-pink-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D63384]">
                    TAHAP 1 DARI 2 — FORMULIR ISI DATA DIRI PESERTA
                  </span>
                  <span className="text-[11px] text-slate-500">Wajib diisi lengkap sebelum memulai tes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input
                      required
                      type="text"
                      value={psyForm.fullName}
                      onChange={(e) => setPsyForm({ ...psyForm, fullName: e.target.value })}
                      placeholder="Nama lengkap peserta sesuai identitas IC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                    <input
                      required
                      type="date"
                      value={psyForm.birthDate}
                      onChange={(e) => setPsyForm({ ...psyForm, birthDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Umur (Tahun) *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={120}
                      value={psyForm.age}
                      onChange={(e) => setPsyForm({ ...psyForm, age: e.target.value })}
                      placeholder="Contoh: 24"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={psyForm.gender}
                      onChange={(e) =>
                        setPsyForm({ ...psyForm, gender: e.target.value as 'Laki-laki' | 'Perempuan' })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan *</label>
                    <input
                      required
                      type="text"
                      value={psyForm.occupation}
                      onChange={(e) => setPsyForm({ ...psyForm, occupation: e.target.value })}
                      placeholder="Pekerjaan saat ini"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No HP / IC *</label>
                    <input
                      required
                      type="text"
                      value={psyForm.phoneOrIC}
                      onChange={(e) => setPsyForm({ ...psyForm, phoneOrIC: e.target.value })}
                      placeholder="Nomor kontak aktif"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Pemeriksaan *</label>
                    <select
                      value={psyForm.purpose}
                      onChange={(e) =>
                        setPsyForm({ ...psyForm, purpose: e.target.value as typeof psyForm.purpose })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                    >
                      <option value="Evaluasi Kesehatan Mental Mandiri">Evaluasi Kesehatan Mental Mandiri</option>
                      <option value="Syarat Kelayakan Kerja / Rekrutmen">Syarat Kelayakan Kerja / Rekrutmen</option>
                      <option value="Lampiran Pengajuan Lisensi / Izin Khusus">Lampiran Pengajuan Lisensi / Izin Khusus</option>
                      <option value="Rujukan Konsultasi & Terapi Medis">Rujukan Konsultasi & Terapi Medis</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Keluhan / Riwayat Psikologis Singkat
                      </label>
                      <span className="text-xs font-medium text-[#20C997] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Opsional & Kerahasiaan Terjamin
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={psyForm.historyNotes}
                      onChange={(e) => setPsyForm({ ...psyForm, historyNotes: e.target.value })}
                      placeholder="Jelaskan secara singkat keluhan, kendala emosional, atau latar belakang pengajuan tes psikologi Anda."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                  >
                    Lanjut ke Form Tes & Evaluasi Psikologi →
                  </button>
                </div>
              </form>
            )}

            {/* FORM UTAMA 2: TES & EVALUASI PSIKOLOGI (Bagian 1: GHQ-12 & Bagian 2: DASS-21) */}
            {psyStep === 'tes_evaluasi' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPsyError('');
                  const ghqCount = Object.keys(ghqAnswers).length;
                  const dassCount = Object.keys(dassAnswers).length;
                  if (ghqCount < GHQ12_QUESTIONS.length || dassCount < DASS21_QUESTIONS.length) {
                    setPsyError(
                      `Harap menjawab seluruh pertanyaan pada Bagian 1 GHQ-12 (${ghqCount}/12 terjawab) dan Bagian 2 DASS-21 (${dassCount}/21 terjawab) sebelum mengirim evaluasi.`
                    );
                    return;
                  }

                  const evalResult = evaluateFullPsychologyAssessment(ghqAnswers, dassAnswers);

                  submitPsychology({
                    fullName: psyForm.fullName.trim(),
                    birthDate: psyForm.birthDate,
                    age: Number(psyForm.age) || 21,
                    gender: psyForm.gender,
                    occupation: psyForm.occupation.trim(),
                    phoneOrIC: psyForm.phoneOrIC.trim(),
                    purpose: psyForm.purpose,
                    historyNotes: psyForm.historyNotes,
                    ghqScore: evalResult.ghqScore,
                    ghqMaxScore: evalResult.ghqMaxScore,
                    ghqInterpretation: evalResult.ghqInterpretation,
                    dassDepressionRaw: evalResult.dassDepressionRaw,
                    dassDepressionScore: evalResult.dassDepressionScore,
                    dassDepressionCategory: evalResult.dassDepressionCategory,
                    dassAnxietyRaw: evalResult.dassAnxietyRaw,
                    dassAnxietyScore: evalResult.dassAnxietyScore,
                    dassAnxietyCategory: evalResult.dassAnxietyCategory,
                    dassStressRaw: evalResult.dassStressRaw,
                    dassStressScore: evalResult.dassStressScore,
                    dassStressCategory: evalResult.dassStressCategory,
                    totalScore: evalResult.totalScore,
                    maxScore: evalResult.maxScore,
                    scorePercentage: evalResult.scorePercentage,
                    interpretationCategory: evalResult.interpretationCategory,
                    interpretationSummary: evalResult.interpretationSummary,
                    recommendation: evalResult.recommendation,
                    answersDetail: evalResult.answersDetail,
                  });

                  setPsyLastResult(evalResult);
                  setPsyStep('selesai');
                }}
                className="space-y-5"
              >
                <div className="p-4 rounded-xl bg-[#FFF5F8] border border-pink-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#D63384]">
                      TAHAP 2 DARI 2 — TES & EVALUASI PSIKOLOGI (GHQ-12 & DASS-21)
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Peserta: <strong>{psyForm.fullName}</strong> · Jawab seluruh butir Bagian 1 (12 Soal) & Bagian 2 (21 Soal).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-[11px] font-mono font-bold text-[#D63384]">
                      GHQ-12: {Object.keys(ghqAnswers).length}/12
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-[11px] font-mono font-bold text-[#0D9488]">
                      DASS-21: {Object.keys(dassAnswers).length}/21
                    </span>
                  </div>
                </div>

                {/* Scrollable Container for Bagian 1 & Bagian 2 */}
                <div className="space-y-6 max-h-[56vh] overflow-y-auto pr-1">
                  {/* BAGIAN 1: SKRINING KESEHATAN MENTAL UMUM (GHQ-12) */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-pink-300">
                        Bagian 1: Skrining Kesehatan Mental Umum (GHQ-12)
                      </h3>
                      <p className="text-xs text-slate-200">
                        <strong>Petunjuk:</strong> Pilih jawaban berdasarkan kondisi yang Anda rasakan selama 2 minggu terakhir.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-300">
                        <div>• <strong>A:</strong> Sama sekali tidak</div>
                        <div>• <strong>B:</strong> Tidak lebih dari biasanya</div>
                        <div>• <strong>C:</strong> Lebih dari biasanya</div>
                        <div>• <strong>D:</strong> Jauh lebih dari biasanya</div>
                      </div>
                    </div>

                    {GHQ12_QUESTIONS.map((q) => {
                      const currentAns = ghqAnswers[q.number];
                      return (
                        <div
                          key={`ghq-${q.number}`}
                          className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono font-bold text-[#E83E8C] uppercase">
                              GHQ-12 · Soal #{q.number} ({q.itemType})
                            </span>
                            {currentAns && (
                              <span className="text-[11px] font-semibold text-[#20C997] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terjawab ({currentAns.code})
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                            {q.number}. {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isChecked = currentAns?.code === opt.code;
                              return (
                                <label
                                  key={opt.code}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                    isChecked
                                      ? 'border-[#E83E8C] bg-[#FFF5F8] font-bold text-slate-900'
                                      : 'border-slate-200 bg-white hover:border-pink-200 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`ghq_q_${q.number}`}
                                    checked={isChecked}
                                    onChange={() => {
                                      setPsyError('');
                                      setGhqAnswers((prev) => ({
                                        ...prev,
                                        [q.number]: {
                                          code: opt.code,
                                          label: opt.label,
                                          score: opt.score,
                                        },
                                      }));
                                    }}
                                    className="accent-[#E83E8C]"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BAGIAN 2: SKALA DEPRESI, KECEMASAN, DAN STRES (DASS-21) */}
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-teal-300">
                        Bagian 2: Skala Depresi, Kecemasan, dan Stres (DASS-21)
                      </h3>
                      <p className="text-xs text-slate-200">
                        <strong>Petunjuk:</strong> Berikan penilaian seberapa sering pernyataan berikut berlaku untuk Anda selama seminggu terakhir.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px] text-slate-300">
                        <div>• <strong>0:</strong> Tidak pernah</div>
                        <div>• <strong>1:</strong> Kadang-kadang</div>
                        <div>• <strong>2:</strong> Sering</div>
                        <div>• <strong>3:</strong> Sangat sering</div>
                      </div>
                    </div>

                    {DASS21_QUESTIONS.map((q) => {
                      const currentAns = dassAnswers[q.number];
                      return (
                        <div
                          key={`dass-${q.number}`}
                          className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono font-bold text-[#0D9488] uppercase">
                              DASS-21 · Soal #{q.number} ({q.subscale})
                            </span>
                            {currentAns && (
                              <span className="text-[11px] font-semibold text-[#20C997] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terjawab (Skala {currentAns.code})
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                            {q.number}. {q.questionText}{' '}
                            <span className="italic font-medium text-slate-500">({q.subscale})</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isChecked = currentAns?.code === opt.code;
                              return (
                                <label
                                  key={opt.code}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                                    isChecked
                                      ? 'border-[#0D9488] bg-teal-50/70 font-bold text-slate-900'
                                      : 'border-slate-200 bg-white hover:border-teal-200 text-slate-700'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`dass_q_${q.number}`}
                                    checked={isChecked}
                                    onChange={() => {
                                      setPsyError('');
                                      setDassAnswers((prev) => ({
                                        ...prev,
                                        [q.number]: {
                                          code: opt.code,
                                          label: opt.label,
                                          score: opt.score,
                                        },
                                      }));
                                    }}
                                    className="accent-[#0D9488]"
                                  />
                                  <span>{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between gap-3 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setPsyStep('data_diri')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium hover:bg-slate-50 cursor-pointer"
                  >
                    ← Kembali ke Data Diri
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                  >
                    Selesai & Kirim Hasil Evaluasi Psikologi
                  </button>
                </div>
              </form>
            )}

            {/* KONFIRMASI SELESAI TES PSIKOLOGI */}
            {psyStep === 'selesai' && psyLastResult && (
              <div className="p-6 rounded-2xl bg-[#FFF5F8] border border-pink-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#20C997] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#D63384] uppercase">
                    TES & EVALUASI PSIKOLOGI BERHASIL DIKIRIM
                  </p>
                  <h3 className="text-xl font-bold text-slate-900">{psyForm.fullName}</h3>
                </div>
                <div className="max-w-xl mx-auto p-4 rounded-xl bg-white border border-pink-100 text-left space-y-2.5 text-xs">
                  <div className="pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-[#D63384] uppercase block">
                      Bagian 1: Skrining Kesehatan Mental Umum (GHQ-12)
                    </span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-slate-600">Skor Total GHQ-12 (Likert 0–3):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {psyLastResult.ghqScore} / 36
                      </span>
                    </div>
                    <p className="text-slate-700 font-semibold mt-0.5">
                      Interpretasi: {psyLastResult.ghqInterpretation}
                    </p>
                  </div>

                  <div className="pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-[#0D9488] uppercase block mb-1">
                      Bagian 2: Skala Depresi, Kecemasan, dan Stres (DASS-21 × 2)
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-500 block">Depresi</span>
                        <strong className="font-mono text-sm text-slate-900">
                          {psyLastResult.dassDepressionScore}
                        </strong>
                        <span className="block text-[10px] font-bold text-[#D63384]">
                          {psyLastResult.dassDepressionCategory}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-500 block">Kecemasan</span>
                        <strong className="font-mono text-sm text-slate-900">
                          {psyLastResult.dassAnxietyScore}
                        </strong>
                        <span className="block text-[10px] font-bold text-[#0D9488]">
                          {psyLastResult.dassAnxietyCategory}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-500 block">Stres</span>
                        <strong className="font-mono text-sm text-slate-900">
                          {psyLastResult.dassStressScore}
                        </strong>
                        <span className="block text-[10px] font-bold text-amber-700">
                          {psyLastResult.dassStressCategory}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <span className="text-slate-500 block mb-0.5">Rekomendasi Evaluasi:</span>
                    <span className="font-semibold text-slate-800">{psyLastResult.recommendation}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hasil penilaian GHQ-12 & DASS-21 lengkap beserta <strong>Sertifikat Tes & Evaluasi Psikologi (.JPEG)</strong> telah tersimpan di Database dan dapat dilihat pada Menu <strong>Tes Psikologi</strong> di Portal Staff.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPsyStep('data_diri');
                      setGhqAnswers({});
                      setDassAnswers({});
                      setPsyLastResult(null);
                      onClose();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold cursor-pointer"
                  >
                    Tutup Halaman
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MODAL OPERASI PLASTIK (Sec 21 — No Citizen ID, No hospital choice) */}
        {activeModal === 'plastic_surgery' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pengajuan Prosedur Operasi Plastik</h2>
                <p className="text-xs text-slate-500">
                  Bedah Rekonstruksi & Estetika oleh Tim Dokter Spesialis RS Cendana
                </p>
              </div>
            </div>

            {plasticUploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {plasticUploadError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  !plasticForm.idPhotoName ||
                  !plasticForm.legalDocName ||
                  !plasticForm.patientCardPhotoName
                ) {
                  setPlasticUploadError(
                    'Harap unggah Foto Identitas/KTP, Foto Kartu Pasien, dan Dokumen SKB (Kepolisian) atau SKWB sebelum mengirim.'
                  );
                  return;
                }
                submitPlasticSurgery({
                  fullName: plasticForm.fullName,
                  birthDate: plasticForm.birthDate,
                  gender: plasticForm.gender,
                  age: Number(plasticForm.age) || 25,
                  occupation: plasticForm.occupation,
                  phoneOrIC: plasticForm.phoneOrIC,
                  surgeryType: plasticForm.surgeryType,
                  idPhotoName: plasticForm.idPhotoName,
                  legalDocName: plasticForm.legalDocName,
                  patientCardPhotoName: plasticForm.patientCardPhotoName,
                });
                onClose();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  required
                  type="text"
                  value={plasticForm.fullName}
                  onChange={(e) => setPlasticForm({ ...plasticForm, fullName: e.target.value })}
                  placeholder="Nama lengkap pasien"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                <input
                  required
                  type="date"
                  value={plasticForm.birthDate}
                  onChange={(e) => setPlasticForm({ ...plasticForm, birthDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={plasticForm.gender}
                  onChange={(e) =>
                    setPlasticForm({
                      ...plasticForm,
                      gender: e.target.value as 'Laki-laki' | 'Perempuan',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Umur (Tahun) *</label>
                <input
                  required
                  type="number"
                  min={18}
                  max={99}
                  value={plasticForm.age}
                  onChange={(e) => setPlasticForm({ ...plasticForm, age: e.target.value })}
                  placeholder="Minimal 18 tahun"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan *</label>
                <input
                  required
                  type="text"
                  value={plasticForm.occupation}
                  onChange={(e) => setPlasticForm({ ...plasticForm, occupation: e.target.value })}
                  placeholder="Pekerjaan pasien"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No HP / IC *</label>
                <input
                  required
                  type="text"
                  value={plasticForm.phoneOrIC}
                  onChange={(e) => setPlasticForm({ ...plasticForm, phoneOrIC: e.target.value })}
                  placeholder="Nomor HP / IC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Operasi Plastik *</label>
                <select
                  value={plasticForm.surgeryType}
                  onChange={(e) => setPlasticForm({ ...plasticForm, surgeryType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                >
                  <option value="Rhinoplasty & Facial Contouring/Oplas ($2,500)">
                    Rhinoplasty & Facial Contouring/Oplas ($2,500)
                  </option>
                  <option value="Full Aesthetic Reconstruction/Half Ped/Full Ped ($1,000)">
                    Full Aesthetic Reconstruction/Half Ped/Full Ped ($1,000)
                  </option>
                  <option value="Klaim Gratis Oplas SKWB (Warga Baru)">
                    Klaim Gratis Oplas SKWB (Warga Baru)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Foto Identitas / KTP (JPG/PNG) *
                </label>
                <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                  <span className="truncate text-slate-700">
                    {plasticForm.idPhotoName || 'Pilih file foto KTP...'}
                  </span>
                  <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPlasticUploadError('');
                        setPlasticForm({ ...plasticForm, idPhotoName: file.name });
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Dokumen SKB (Kepolisian) atau SKWB (PDF/JPG/PNG) *
                </label>
                <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                  <span className="truncate text-slate-700">
                    {plasticForm.legalDocName || 'Pilih dokumen SKB / SKWB...'}
                  </span>
                  <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPlasticUploadError('');
                        setPlasticForm({ ...plasticForm, legalDocName: file.name });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Foto Kartu Pasien (JPG/PNG) *
                </label>
                <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                  <span className="truncate text-slate-700">
                    {plasticForm.patientCardPhotoName || 'Pilih file foto Kartu Pasien...'}
                  </span>
                  <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPlasticUploadError('');
                        setPlasticForm({ ...plasticForm, patientCardPhotoName: file.name });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="sm:col-span-2 pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                >
                  Ajukan Operasi Plastik
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. MODAL TES BUTA WARNA (Sec 23) */}
        {activeModal === 'color_blind' && <IshiharaTestSection onClose={onClose} />}

        {/* 5. MODAL JADWAL DOKTER (Sec 19) */}
        {activeModal === 'doctor_schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Jadwal Praktik Dokter RS Cendana</h2>
                <p className="text-xs text-slate-500">
                  Pilih dokter untuk membuat janji temu konsultasi langsung
                </p>
              </div>

              {/* Interactive Filter Controls */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FFF5F8] rounded-xl border border-pink-100">
                {[
                  'Semua',
                  'Doctor',
                  'Spesialis Obgyn',
                  'Spesialis Kecantikan',
                  'Spesialis Forensik',
                  'Spesialis Jantung',
                  'Spesialis Bedah',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setScheduleFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      scheduleFilter === cat
                        ? 'bg-[#E83E8C] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#D63384]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchedules.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-pink-100 bg-white hover:border-[#E83E8C]/40 transition flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={doc.doctorAvatar}
                      alt={doc.doctorName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-pink-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">{doc.doctorName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.doctorRole} · {doc.specialty}
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#E83E8C]" />
                          <span>{doc.days}</span>
                        </div>
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-[#20C997]" />
                          <span>
                            {doc.startTime} – {doc.endTime} WIB · Status:{' '}
                            <strong className="text-[#20C997]">{doc.status}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectDoctorForAppointment(doc);
                      onOpenModal('appointment');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold hover:opacity-95 transition cursor-pointer"
                  >
                    Buat Janji Temu
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. MODAL BUAT JANJI TEMU (Sec 20) */}
        {activeModal === 'appointment' && (
          <div className="space-y-6">
            <div className="border-b border-pink-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Buat Janji Temu Dokter</h2>
              <p className="text-xs text-slate-500">
                Jadwalkan pemeriksaan bersama tim dokter RS Cendana
              </p>
            </div>

            {!selectedDoctorForAppointment ? (
              /* Sec 20: Jika berasal dari Quick Access tanpa memilih dokter */
              <div className="p-8 rounded-2xl bg-[#FFF5F8] border border-pink-200/70 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E83E8C]/15 text-[#E83E8C] flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <p className="text-base font-semibold text-slate-800">
                  Belum memilih dokter? Silakan pilih dokter dari Jadwal Praktik Dokter.
                </p>
                <button
                  onClick={() => onOpenModal('doctor_schedule')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                >
                  Pilih Dokter
                </button>
              </div>
            ) : (
              /* Sec 20: Jika berasal dari Card Dokter */
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#FFF5F8] border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedDoctorForAppointment.doctorAvatar}
                      alt={selectedDoctorForAppointment.doctorName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-pink-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedDoctorForAppointment.doctorName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {selectedDoctorForAppointment.specialty} · {selectedDoctorForAppointment.days} (
                        {selectedDoctorForAppointment.startTime}–{selectedDoctorForAppointment.endTime})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenModal('doctor_schedule')}
                    className="px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-xs font-semibold text-[#D63384] hover:bg-pink-50 cursor-pointer whitespace-nowrap"
                  >
                    Ganti Dokter
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAppointment({
                      patientName: aptForm.patientName,
                      patientPhone: aptForm.patientPhone,
                      patientAge: Number(aptForm.patientAge) || 25,
                      doctorId: selectedDoctorForAppointment.doctorId,
                      doctorName: selectedDoctorForAppointment.doctorName,
                      doctorRole: selectedDoctorForAppointment.doctorRole,
                      specialty: selectedDoctorForAppointment.specialty,
                      scheduleId: selectedDoctorForAppointment.id,
                      date: aptForm.date,
                      time: aptForm.time,
                      complaint: aptForm.complaint,
                    });
                    onClose();
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pasien *</label>
                    <input
                      required
                      type="text"
                      value={aptForm.patientName}
                      onChange={(e) => setAptForm({ ...aptForm, patientName: e.target.value })}
                      placeholder="Nama lengkap pasien"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No HP / IC *</label>
                    <input
                      required
                      type="text"
                      value={aptForm.patientPhone}
                      onChange={(e) => setAptForm({ ...aptForm, patientPhone: e.target.value })}
                      placeholder="Nomor telepon / IC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Kunjungan *</label>
                    <input
                      required
                      type="date"
                      value={aptForm.date}
                      onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Kunjungan *</label>
                    <input
                      required
                      type="time"
                      value={aptForm.time}
                      onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keluhan Medis / Keperluan Konsultasi *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={aptForm.complaint}
                      onChange={(e) => setAptForm({ ...aptForm, complaint: e.target.value })}
                      placeholder="Tuliskan keluhan kesehatan atau tujuan konsultasi Anda..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                    >
                      Konfirmasi Janji Temu
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 7. MODAL REGULASI PENGOBATAN (Sec 25 & 82 — 100% uncropped object-contain) */}
        {activeModal === 'regulation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-100 pb-4 pr-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Regulasi Pengobatan & Tarif Layanan RS Cendana</h2>
                <p className="text-xs text-slate-500">
                  Seluruh infografis regulasi ditampilkan utuh 100% dengan proporsi asli
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRegZoom((z) => Math.max(75, z - 15))}
                  className="p-2 rounded-lg border border-pink-200 text-slate-700 hover:bg-pink-50 cursor-pointer"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums w-12 text-center">
                  {regZoom}%
                </span>
                <button
                  onClick={() => setRegZoom((z) => Math.min(145, z + 15))}
                  className="p-2 rounded-lg border border-pink-200 text-slate-700 hover:bg-pink-50 cursor-pointer"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRegZoom(100)}
                  className="p-2 rounded-lg border border-pink-200 text-slate-700 hover:bg-pink-50 cursor-pointer"
                  title="Reset Ukuran"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {regulations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl border border-pink-100 bg-[#FFF5F8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{reg.title}</h3>
                      <p className="text-xs text-slate-500">
                        {reg.category} · Diperbarui {reg.updatedAt} oleh {reg.updatedBy}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">{reg.description}</p>

                  {/* CRITICAL RULE SEC 25 & 82: ALL regulation images MUST be 100% visible, uncropped, object-contain, natural aspect ratio */}
                  <div className="w-full rounded-xl bg-white border border-pink-100 p-3 sm:p-5 flex items-center justify-center overflow-x-auto">
                    <img
                      src={reg.imageUrl}
                      alt={reg.title}
                      referrerPolicy="no-referrer"
                      style={{ width: `${regZoom}%`, maxWidth: '100%' }}
                      className="h-auto max-h-none object-contain mx-auto block rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. MODAL RECRUITMENT PARAMEDIC (Sec 13) */}
        {activeModal === 'recruitment' && (
          <div className="space-y-6">
            <div className="border-b border-pink-100 pb-4 pr-10">
              <h2 className="text-xl font-bold text-slate-900">
                Recruitment Medis Cendana Roleplay
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulir Pendaftaran Paramedis Cendana Medical Center · Status:{' '}
                <strong className="text-[#E83E8C]">{recruitmentStatus}</strong>
              </p>
            </div>

            {recSubmittedSuccess ? (
              /* POP UP SETELAH BERHASIL SUBMIT */
              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF5F8] border-2 border-[#E83E8C]/30 text-center space-y-5 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#20C997]/15 text-[#20C997] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-3 max-w-xl mx-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    Formulir pendaftaran anda sudah berhasil dikirim ke HRD Cendara Medical Center
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                    Pengumuman selanjutnya akan diberitahukan melalui website (discord).
                  </p>
                  <p className="text-sm font-semibold text-[#D63384] pt-1">
                    Terima kasih sudah berpartisipasi mengikuti proses recruitment Cendana Medical Center!
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecSubmittedSuccess(false);
                      onClose();
                    }}
                    className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                  >
                    Tutup & Kembali ke Beranda
                  </button>
                </div>
              </div>
            ) : recruitmentStatus === 'CLOSED' ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF5F8] border border-pink-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E83E8C]/15 text-[#E83E8C] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed max-w-xl mx-auto">
                  Saat ini pendaftaran Paramedic sedang ditutup. Untuk informasi selengkapnya mengenai pembukaan rekrutmen, silakan cek di website utama pada bagian{' '}
                  <span className="font-mono font-bold text-[#D63384]">#announcement-hospital</span>.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold cursor-pointer"
                >
                  Mengerti & Tutup
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRecError('');

                  if (
                    !recForm.age17Plus ||
                    !recForm.dedicatedUnderPressure ||
                    !recForm.willingTraining1To3Days ||
                    !recForm.willingFollowSOP
                  ) {
                    setRecError(
                      'Mohon centang seluruh persyaratan umum bergabung menjadi bagian dari EMS pada bagian INFORMASI IC.'
                    );
                    return;
                  }

                  if (
                    !recForm.ktpPhotoName ||
                    !recForm.skbPhotoName ||
                    !recForm.suratKesehatanPhotoName ||
                    !recForm.suratPsikologPhotoName
                  ) {
                    setRecError(
                      'Mohon lampirkan seluruh dokumen wajib: FOTO KTP IC, FOTO SKB, FOTO Surat Kesehatan, dan FOTO Surat Psikolog.'
                    );
                    return;
                  }

                  // Hitung estimasi umur dari Tanggal Lahir IC jika diisi
                  let calculatedAge = 20;
                  if (recForm.birthDateIC) {
                    const birthYear = new Date(recForm.birthDateIC).getFullYear();
                    const currentYear = new Date().getFullYear();
                    if (!isNaN(birthYear) && currentYear >= birthYear) {
                      calculatedAge = Math.max(17, currentYear - birthYear);
                    }
                  }

                  submitRecruitment({
                    fullName: recForm.fullName,
                    age: calculatedAge,
                    gender: recForm.gender,
                    phoneOrIC: `Tgl Lahir IC: ${recForm.birthDateIC}`,
                    email: `Jam Online: ${recForm.onlineHoursOOC}`,
                    education: `Hari Online: ${recForm.onlineDaysOOC}`,
                    experience: recForm.experience,
                    motivation: recForm.motivation,
                    icGeneralRequirements: {
                      age17Plus: recForm.age17Plus,
                      dedicatedUnderPressure: recForm.dedicatedUnderPressure,
                      willingTraining1To3Days: recForm.willingTraining1To3Days,
                      willingFollowSOP: recForm.willingFollowSOP,
                    },
                    icInterviewRequirements: {
                      hasKtpIme: recForm.hasKtpIme,
                      hasSkb: recForm.hasSkb,
                      hasSim: recForm.hasSim,
                      hasSuratKesehatan: recForm.hasSuratKesehatan,
                      hasSuratPsikolog: recForm.hasSuratPsikolog,
                    },
                    birthDateIC: recForm.birthDateIC,
                    rpExperienceOOC: recForm.rpExperienceOOC,
                    ktpPhotoName: recForm.ktpPhotoName,
                    skbPhotoName: recForm.skbPhotoName,
                    suratKesehatanPhotoName: recForm.suratKesehatanPhotoName,
                    suratPsikologPhotoName: recForm.suratPsikologPhotoName,
                    otherCityResponsibilityOOC: recForm.otherCityResponsibilityOOC,
                    onlineHoursOOC: recForm.onlineHoursOOC,
                    onlineDaysOOC: recForm.onlineDaysOOC,
                  });

                  setRecSubmittedSuccess(true);
                }}
                className="space-y-6"
              >
                {recError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                    {recError}
                  </div>
                )}

                {/* BAGIAN 1: INFORMASI IC */}
                <div className="p-5 rounded-2xl bg-[#FFF5F8] border border-pink-100 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#D63384]">INFORMASI IC</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Isilah pernyataan di bawah ini sebagai persyaratan umum untuk bisa mendaftar menjadi anggota paramedic Cendana Medical Center.
                    </p>
                  </div>

                  {/* Persyaratan Umum EMS */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-800">
                      Berikut ini adalah persyaratan umum untuk bergabung menjadi bagian dari EMS
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.age17Plus}
                          onChange={(e) =>
                            setRecForm({ ...recForm, age17Plus: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Berusia 17 Tahun Saat Mendaftar (IC)
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.dedicatedUnderPressure}
                          onChange={(e) =>
                            setRecForm({ ...recForm, dedicatedUnderPressure: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Berdedikasi tinggi, mampu bekerja dalam tekanan dan berkemauan untuk belajar
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.willingTraining1To3Days}
                          onChange={(e) =>
                            setRecForm({ ...recForm, willingTraining1To3Days: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Bersedia mengikuti masa training selama 1-3 hari
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.willingFollowSOP}
                          onChange={(e) =>
                            setRecForm({ ...recForm, willingFollowSOP: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Bersedia mengikuti Standar Operasi dan Prosedur yang berlaku selama menjadi anggota EMS
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Syarat IC Sebelum Interview */}
                  <div className="space-y-2.5 pt-2 border-t border-pink-100">
                    <p className="text-xs font-bold text-slate-800">
                      Berikut adaalah syarat ic yang harus dimiliki sebelum dilakukan interview
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.hasKtpIme}
                          onChange={(e) =>
                            setRecForm({ ...recForm, hasKtpIme: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Kartu Identitas Warga Cendana (KTP)
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.hasSkb}
                          onChange={(e) =>
                            setRecForm({ ...recForm, hasSkb: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Memiliki SKB
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.hasSim}
                          onChange={(e) =>
                            setRecForm({ ...recForm, hasSim: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          SIM (bisa menyusul kalau sudah diterima)
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={recForm.hasSuratKesehatan}
                          onChange={(e) =>
                            setRecForm({ ...recForm, hasSuratKesehatan: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Memiliki Surat Kesehatan
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-pink-100 hover:border-[#E83E8C]/40 cursor-pointer transition sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={recForm.hasSuratPsikolog}
                          onChange={(e) =>
                            setRecForm({ ...recForm, hasSuratPsikolog: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#E83E8C] rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          Memiliki Surat Psikolog
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* BAGIAN 2: CURICULUM VITAE IC */}
                <div className="p-5 rounded-2xl bg-white border border-pink-100 space-y-4">
                  <div className="border-b border-pink-100 pb-3">
                    <h3 className="text-base font-bold text-[#D63384]">CURICULUM VITAE IC</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Isilah identitas dan daftar riwayat hidup anda sesuai format di bawah ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Nama Kharakter (IC) *
                      </label>
                      <input
                        required
                        type="text"
                        value={recForm.fullName}
                        onChange={(e) => setRecForm({ ...recForm, fullName: e.target.value })}
                        placeholder="Masukkan Nama Karakter (IC)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Jenis Kelamin *
                      </label>
                      <select
                        value={recForm.gender}
                        onChange={(e) =>
                          setRecForm({
                            ...recForm,
                            gender: e.target.value as 'Laki-laki' | 'Perempuan',
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Tanggal Lahir (IC) *
                      </label>
                      <input
                        required
                        type="date"
                        value={recForm.birthDateIC}
                        onChange={(e) => setRecForm({ ...recForm, birthDateIC: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-0.5">
                      Pengalaman Menjadi Anggota Medis/Petinggi EMS *
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Apabila memiliki pengalaman petinggi medis/EMS, harap dijelaskan secara singkat. Apabila tidak, tuliskan 0
                    </p>
                    <textarea
                      required
                      rows={2}
                      value={recForm.experience}
                      onChange={(e) => setRecForm({ ...recForm, experience: e.target.value })}
                      placeholder="Tuliskan pengalaman medis/EMS Anda atau isi 0 jika belum ada..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Mengapa anda ingin bergabung dengan Cendana Medical Center? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={recForm.motivation}
                      onChange={(e) => setRecForm({ ...recForm, motivation: e.target.value })}
                      placeholder="Jelaskan motivasi dan tujuan Anda bergabung bersama Cendana Medical Center..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-0.5">
                      Pengalaman Bermain RP (OOC) *
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      (Jika tidak memiliki pengalaman, silakan isi 0 atau -). Jika memiliki pengalaman, jelaskan sudah berapa lama bermain RP dan pernah berperan sebagai apa saja (White Side/Bad Side).
                    </p>
                    <textarea
                      required
                      rows={2}
                      value={recForm.rpExperienceOOC}
                      onChange={(e) => setRecForm({ ...recForm, rpExperienceOOC: e.target.value })}
                      placeholder="Contoh: 2 tahun bermain RP, pernah berperan sebagai White Side (EMS / Polisi) atau isi 0 / - ..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  {/* Lampiran 4 Foto Dokumen IC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Mohon Lampirkan FOTO KTP IC *
                        <span className="block text-[11px] font-normal text-rose-600">
                          (*jika tidak sesuai dengan nama IC, auto rejected)
                        </span>
                      </label>
                      <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                        <span className="truncate text-slate-700">
                          {recForm.ktpPhotoName || 'Pilih file FOTO KTP IC...'}
                        </span>
                        <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setRecError('');
                              setRecForm({ ...recForm, ktpPhotoName: file.name });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Mohon Lampirkan FOTO SKB *
                        <span className="block text-[11px] font-normal text-rose-600">
                          (*jika sudah kadaluarsa dan tujuan tidak sesuai, auto rejected)
                        </span>
                      </label>
                      <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                        <span className="truncate text-slate-700">
                          {recForm.skbPhotoName || 'Pilih file FOTO SKB...'}
                        </span>
                        <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setRecError('');
                              setRecForm({ ...recForm, skbPhotoName: file.name });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Mohon Lampirkan FOTO Surat Kesehatan *
                        <span className="block text-[11px] font-normal text-rose-600">
                          (*jika sudah kadaluarsa dan tujuan tidak sesuai, auto rejected)
                        </span>
                      </label>
                      <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                        <span className="truncate text-slate-700">
                          {recForm.suratKesehatanPhotoName || 'Pilih file FOTO Surat Kesehatan...'}
                        </span>
                        <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setRecError('');
                              setRecForm({ ...recForm, suratKesehatanPhotoName: file.name });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Mohon Lampirkan FOTO Surat Psikolog *
                        <span className="block text-[11px] font-normal text-rose-600">
                          (*jika sudah kadaluarsa dan tujuan tidak sesuai, auto rejected)
                        </span>
                      </label>
                      <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-pink-300 bg-[#FFF5F8] cursor-pointer hover:bg-pink-50 transition text-xs">
                        <span className="truncate text-slate-700">
                          {recForm.suratPsikologPhotoName || 'Pilih file FOTO Surat Psikolog...'}
                        </span>
                        <Upload className="w-4 h-4 text-[#E83E8C] shrink-0" />
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setRecError('');
                              setRecForm({ ...recForm, suratPsikologPhotoName: file.name });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* BAGIAN 3: INFORMASI OOC */}
                <div className="p-5 rounded-2xl bg-[#FFF5F8] border border-pink-100 space-y-4">
                  <div className="border-b border-pink-100 pb-3">
                    <h3 className="text-base font-bold text-[#D63384]">INFORMASI OOC</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Isilah data dibawah ini dengan benar dan jujur.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Apakah ada tanggung jawab di kota lain? Jika ada siap membagi waktu? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={recForm.otherCityResponsibilityOOC}
                      onChange={(e) =>
                        setRecForm({ ...recForm, otherCityResponsibilityOOC: e.target.value })
                      }
                      placeholder="Jawab dengan jujur apakah ada tanggung jawab di kota lain dan kesiapan membagi waktu..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Jam Online / Masuk Kota *
                      </label>
                      <input
                        required
                        type="text"
                        value={recForm.onlineHoursOOC}
                        onChange={(e) =>
                          setRecForm({ ...recForm, onlineHoursOOC: e.target.value })
                        }
                        placeholder="Contoh: 19:00 - 24:00 WIB"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#E83E8C] focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Hari Online / Masuk Kota *
                      </label>
                      <input
                        required
                        type="text"
                        value={recForm.onlineDaysOOC}
                        onChange={(e) =>
                          setRecForm({ ...recForm, onlineDaysOOC: e.target.value })
                        }
                        placeholder="Contoh: Senin s/d Minggu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#E83E8C] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 pt-1">Terimakasih</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 cursor-pointer"
                  >
                    Kirim Formulir Pendaftaran
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 9. MODAL FORM KLAIM BENEFIT SKWB */}
        {activeModal === 'skwb_claim' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Klaim Benefit SKWB</h2>
                <p className="text-xs text-slate-500">
                  Formulir Pendaftaran & Klaim Benefit Kesehatan Surat Keterangan Warga Baru (Berlaku 7 Hari Sejak Tanggal Terbit SKWB)
                </p>
              </div>
            </div>

            {skwbSubmittedClaim ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#20C997] text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900">
                    Pengajuan Klaim Benefit SKWB Berhasil Disimpan!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                    Data SKWB Anda telah tersimpan secara terpusat di Database Paramedic Cendana. Silakan kunjungi petugas medis (Paramedic ke atas) untuk melakukan pengambilan benefit.
                  </p>
                </div>

                <div className="max-w-md mx-auto bg-white rounded-xl border border-emerald-200 p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nama IC:</span>
                    <span className="font-bold text-slate-900">{skwbSubmittedClaim.icName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tanggal Lahir:</span>
                    <span className="font-mono font-semibold text-slate-800">{skwbSubmittedClaim.birthDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tanggal Terbit SKWB:</span>
                    <span className="font-mono font-semibold text-slate-800">{skwbSubmittedClaim.issueDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Masa Berlaku Benefit (7 Hari):</span>
                    <span className="font-mono font-bold text-[#D63384]">
                      {skwbSubmittedClaim.startDate} s/d {skwbSubmittedClaim.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Status Benefit:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        skwbSubmittedClaim.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {skwbSubmittedClaim.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSkwbSubmittedClaim(null);
                      setSkwbForm({
                        icName: '',
                        birthDate: '',
                        issueDate: new Date().toISOString().slice(0, 10),
                        photoFileName: '',
                        photoFileSize: 0,
                        photoDataUrl: '',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-pink-200 bg-white text-[#D63384] text-xs font-semibold hover:bg-pink-50 cursor-pointer"
                  >
                    Ajukan SKWB Lainnya
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSkwbSubmittedClaim(null);
                      onClose();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSkwbUploadError('');
                  if (!skwbForm.icName.trim()) {
                    setSkwbUploadError('Nama IC wajib diisi sesuai identitas.');
                    return;
                  }
                  if (!skwbForm.birthDate) {
                    setSkwbUploadError('Tanggal Lahir wajib dipilih.');
                    return;
                  }
                  if (!skwbForm.issueDate) {
                    setSkwbUploadError('Tanggal Terbit SKWB wajib dipilih.');
                    return;
                  }
                  if (!skwbForm.photoDataUrl || !skwbForm.photoFileName) {
                    setSkwbUploadError('Anda wajib mengunggah Foto Surat Keterangan Warga Baru (SKWB).');
                    return;
                  }

                  const res = submitSKWBClaim({
                    icName: skwbForm.icName.trim(),
                    birthDate: skwbForm.birthDate,
                    issueDate: skwbForm.issueDate,
                    photoFileName: skwbForm.photoFileName,
                    photoFileSize: skwbForm.photoFileSize,
                    photoDataUrl: skwbForm.photoDataUrl,
                  });

                  if (res.success && res.claim) {
                    setSkwbSubmittedClaim({
                      icName: res.claim.icName,
                      birthDate: res.claim.birthDate,
                      issueDate: res.claim.issueDate,
                      startDate: res.claim.startDate,
                      endDate: res.claim.endDate,
                      status: res.claim.status,
                    });
                  }
                }}
                className="space-y-5"
              >
                {/* Ringkasan Benefit SKWB */}
                <div className="p-4 rounded-xl bg-[#FFF5F8] border border-pink-200/80 space-y-2">
                  <p className="text-xs font-bold text-[#D63384]">
                    Informasi Hak & Masa Berlaku Benefit SKWB (7 Hari Sejak Tanggal Terbit SKWB):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-pink-100">
                      <p className="font-bold text-slate-900">1. Paket Sedang</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Obat & Perban · Dapat diklaim 1x setiap hari selama SKWB aktif (Oleh Co-ass+)
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-pink-100">
                      <p className="font-bold text-slate-900">2. Diskon 50% Kartu Pasien</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Berlaku 1x klaim selama periode SKWB aktif (Oleh Paramedic+)
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-pink-100">
                      <p className="font-bold text-slate-900">3. Free 1x Oplas</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Gratis 1x Operasi Plastik selama periode SKWB aktif (Oleh Doctor+)
                      </p>
                    </div>
                  </div>
                </div>

                {skwbUploadError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                    {skwbUploadError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama IC */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama IC (Sesuai Identitas) *
                    </label>
                    <input
                      required
                      type="text"
                      value={skwbForm.icName}
                      onChange={(e) => setSkwbForm({ ...skwbForm, icName: e.target.value })}
                      placeholder="Masukkan nama lengkap sesuai identitas IC Anda"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Lahir *
                    </label>
                    <input
                      required
                      type="date"
                      value={skwbForm.birthDate}
                      onChange={(e) => setSkwbForm({ ...skwbForm, birthDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm font-mono"
                    />
                  </div>

                  {/* Tanggal Terbit SKWB */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Terbit SKWB *
                    </label>
                    <input
                      required
                      type="date"
                      value={skwbForm.issueDate}
                      onChange={(e) => setSkwbForm({ ...skwbForm, issueDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Kalkulasi Otomatis Masa Berlaku */}
                {skwbForm.issueDate && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Perhitungan Masa Berlaku Otomatis (7 Hari): </span>
                      <strong className="font-mono text-slate-900">
                        {skwbForm.issueDate} s/d {computePreviewEndDate(skwbForm.issueDate)}
                      </strong>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold self-start sm:self-auto ${
                        new Date().toISOString().slice(0, 10) <= computePreviewEndDate(skwbForm.issueDate)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {new Date().toISOString().slice(0, 10) <= computePreviewEndDate(skwbForm.issueDate)
                        ? 'Status: Aktif'
                        : 'Status: Kadaluarsa'}
                    </span>
                  </div>
                )}

                {/* Upload Foto Surat Keterangan Warga Baru (SKWB) */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Upload Foto Surat Keterangan Warga Baru (SKWB) *
                  </label>

                  {!skwbForm.photoDataUrl ? (
                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-pink-300 bg-[#FFF5F8] hover:bg-pink-50/80 transition cursor-pointer text-center space-y-2">
                      <div className="w-11 h-11 rounded-xl bg-white border border-pink-100 text-[#E83E8C] flex items-center justify-center shadow-2xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {skwbUploading ? 'Memproses gambar...' : 'Klik untuk memilih Foto Surat SKWB'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Mendukung format JPG, JPEG, PNG, WEBP (Maks. 5 MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={skwbUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSKWBImageUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FFF5F8] border border-pink-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={skwbForm.photoDataUrl}
                            alt="Preview SKWB"
                            className="w-20 h-20 rounded-xl object-cover border border-pink-200 bg-white shrink-0"
                          />
                          <div className="min-w-0 space-y-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {skwbForm.photoFileName}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500">
                              Ukuran File: {(skwbForm.photoFileSize / 1024).toFixed(1)} KB
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#20C997]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Siap diunggah ke Database
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Tombol Mengganti File */}
                          <label className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-[#D63384] hover:bg-pink-50 text-xs font-semibold cursor-pointer transition">
                            Ganti File
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSKWBImageUpload(file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {/* Tombol Menghapus File sebelum submit */}
                          <button
                            type="button"
                            onClick={() =>
                              setSkwbForm((prev) => ({
                                ...prev,
                                photoFileName: '',
                                photoFileSize: 0,
                                photoDataUrl: '',
                              }))
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition"
                          >
                            Hapus File
                          </button>
                        </div>
                      </div>

                      {/* Full Preview Image */}
                      <div className="rounded-xl overflow-hidden border border-pink-100 bg-white max-h-64 flex items-center justify-center p-2">
                        <img
                          src={skwbForm.photoDataUrl}
                          alt="Preview Surat SKWB"
                          className="max-h-56 w-auto object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={skwbUploading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E83E8C] to-[#D63384] text-white text-sm font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    Simpan / Ajukan Klaim
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
