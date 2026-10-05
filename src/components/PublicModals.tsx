import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DoctorSchedule } from '../types';
import { IshiharaTestSection } from './IshiharaTest';
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
  | 'recruitment';

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
  } = useApp();

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

  // Psychology Form State
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

        {/* 2. MODAL TES PSIKOLOGI (Sec 22 — No Tatap Muka/Online option) */}
        {activeModal === 'psychology' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E83E8C] to-[#D63384] text-white flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pendaftaran Tes & Evaluasi Psikologi</h2>
                <p className="text-xs text-slate-500">
                  Kerahasiaan Medis Terjamin · Diakses khusus oleh Co-ass ke atas
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitPsychology({
                  fullName: psyForm.fullName,
                  birthDate: psyForm.birthDate,
                  age: Number(psyForm.age) || 21,
                  gender: psyForm.gender,
                  occupation: psyForm.occupation,
                  phoneOrIC: psyForm.phoneOrIC,
                  purpose: psyForm.purpose,
                  historyNotes: psyForm.historyNotes,
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
                  value={psyForm.fullName}
                  onChange={(e) => setPsyForm({ ...psyForm, fullName: e.target.value })}
                  placeholder="Nama lengkap peserta"
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
                  rows={3}
                  value={psyForm.historyNotes}
                  onChange={(e) => setPsyForm({ ...psyForm, historyNotes: e.target.value })}
                  placeholder="Jelaskan secara singkat keluhan, kendala emosional, atau latar belakang pengajuan tes psikologi Anda."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E83E8C] focus:outline-none text-sm"
                />
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
                  Daftar Tes Psikologi
                </button>
              </div>
            </form>
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
                {['Semua', 'Doctor', 'Specialist Doctor', 'Spesialis Bedah'].map((cat) => (
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
                          Kartu Identitas Warga IME Medical Center (KTP)
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
      </div>
    </div>
  );
};
