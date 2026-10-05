export type RoleName =
  | 'Medical Support'
  | 'Trainee'
  | 'Paramedic'
  | 'Co-ass'
  | 'Doctor'
  | 'Specialist Doctor'
  | 'Heads of Departments'
  | 'Deputy Chief'
  | 'Chief Executive Officer'
  | 'Executive Board';

export const ROLE_LEVELS: Record<RoleName, number> = {
  'Medical Support': 1,
  'Trainee': 2,
  'Paramedic': 3,
  'Co-ass': 4,
  'Doctor': 5,
  'Specialist Doctor': 6,
  'Heads of Departments': 7,
  'Deputy Chief': 8,
  'Chief Executive Officer': 9,
  'Executive Board': 10,
};

export const ROLE_LIST: RoleName[] = [
  'Medical Support',
  'Trainee',
  'Paramedic',
  'Co-ass',
  'Doctor',
  'Specialist Doctor',
  'Heads of Departments',
  'Deputy Chief',
  'Chief Executive Officer',
  'Executive Board',
];

export type AccountStatus = 'Pending Approval' | 'Active' | 'Rejected' | 'Inactive';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleName;
  level: number;
  status: AccountStatus;
  avatarUrl: string;
  specialty?: string;
  joinDate: string;
  registeredAt: string;
  bio?: string;
  phone?: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorRole: RoleName;
  doctorAvatar: string;
  specialty: string;
  days: string;
  startTime: string;
  endTime: string;
  status: 'Available' | 'Full' | 'Off Duty';
}

export interface SKSRecord {
  id: string;
  fullName: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number;
  occupation: string;
  phoneOrIC: string;
  purpose: 'Pemeriksaan Rutin' | 'Lampiran Pembuatan Lisensi' | 'Lampiran Melamar Pekerjaan';
  createdAt: string;
  status: 'Issued' | 'Verified' | 'Pending';
}

export interface PsychologyRecord {
  id: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  occupation: string;
  phoneOrIC: string;
  purpose:
    | 'Evaluasi Kesehatan Mental Mandiri'
    | 'Syarat Kelayakan Kerja / Rekrutmen'
    | 'Lampiran Pengajuan Lisensi / Izin Khusus'
    | 'Rujukan Konsultasi & Terapi Medis';
  historyNotes?: string;
  createdAt: string;
  status: 'Reviewed' | 'Scheduled' | 'Completed';
}

export interface PlasticSurgeryRecord {
  id: string;
  fullName: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  age: number;
  occupation: string;
  phoneOrIC: string;
  surgeryType: string;
  idPhotoName: string;
  legalDocName: string; // Dokumen SKB (Kepolisian) atau SKWB
  patientCardPhotoName?: string; // Foto Kartu Pasien
  handlingDoctorName?: string; // Nama dokter yang menangani / menyetujui
  approvedAt?: string;
  createdAt: string;
  status: 'Pending Review' | 'Approved' | 'Completed' | 'Rejected';
}

export interface ColorBlindResult {
  id: string;
  fullName: string;
  testDate: string;
  correctCount: number;
  wrongCount: number;
  totalPlates: number;
  scorePercentage: number;
  category: 'Normal' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia';
  answersDetail: {
    plateNumber: number;
    expected: string;
    userAnswer: string;
    isCorrect: boolean;
    type: string;
  }[];
}

export interface AppointmentRecord {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  doctorRole: RoleName;
  specialty: string;
  scheduleId: string;
  date: string;
  time: string;
  complaint: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface ComplaintRecord {
  id: string;
  type: 'Laporan / Keluhan' | 'Masukan / Saran';
  reporterName: string;
  isAnonymous: boolean;
  subject: string;
  chronology: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  status: 'Baru' | 'Diproses' | 'Selesai' | 'Ditolak';
  internalNote?: string;
  createdAt: string;
}

export interface RecruitmentApplicant {
  id: string;
  // Legacy / Summary fields
  fullName: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  phoneOrIC: string;
  email: string;
  education: string;
  experience: string;
  motivation: string;
  // Detailed Recruitment Medis Cendana Roleplay (IC & OOC)
  icGeneralRequirements?: {
    age17Plus: boolean;
    dedicatedUnderPressure: boolean;
    willingTraining1To3Days: boolean;
    willingFollowSOP: boolean;
  };
  icInterviewRequirements?: {
    hasKtpIme: boolean;
    hasSkb: boolean;
    hasSim: boolean;
    hasSuratKesehatan: boolean;
    hasSuratPsikolog: boolean;
  };
  birthDateIC?: string;
  rpExperienceOOC?: string;
  ktpPhotoName?: string;
  skbPhotoName?: string;
  suratKesehatanPhotoName?: string;
  suratPsikologPhotoName?: string;
  otherCityResponsibilityOOC?: string;
  onlineHoursOOC?: string;
  onlineDaysOOC?: string;
  appliedAt: string;
  status: 'Pending' | 'Interview' | 'Accepted' | 'Rejected';
}

export interface VotingOption {
  id: string;
  label: string;
  votes: string[]; // array of staff IDs
}

export interface VotingPoll {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'Open' | 'Closed';
  createdBy: string;
  createdAt: string;
  options: VotingOption[];
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: RoleName;
  leaveType: 'Cuti Tahunan' | 'Cuti Sakit' | 'Cuti Darurat / Keluarga' | 'Izin Khusus';
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  attachmentName?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  reviewedBy?: string;
}

export interface ResignRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: RoleName;
  submittedDate: string;
  effectiveDate: string;
  reason: string;
  additionalDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  reviewedBy?: string;
}

export interface SOPDocument {
  id: string;
  title: string;
  category: 'Prosedur UGD' | 'Rawat Inap & Bedah' | 'Etika & Disiplin' | 'Farmasi & Logistik' | 'Protokol Kriminal / Konflik';
  version: string;
  updatedAt: string;
  author: string;
  content: string;
  pdfFileName?: string;
  pdfDataUrl?: string;
}

export interface RegulationItem {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  updatedBy: string;
  imageUrl: string;
  description: string;
}

export interface DutyLog {
  id: string;
  staffId: string;
  staffName: string;
  role: RoleName;
  jobTitleInLog: string;
  durationMinutes: number;
  durationFormatted: string;
  startDate: string; // YYYY-MM-DD HH:mm
  endDate: string;   // YYYY-MM-DD HH:mm
  weekKey: string;   // e.g. '2026-W40'
  monthKey: string;  // e.g. '2026-10'
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: RoleName;
  period: string;
  basicSalary: number;
  dutyHours: number;
  dutyBonus: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
  paymentStatus: 'Paid' | 'Pending' | 'Processing';
  paidAt?: string;
}

export interface RoleSalaryConfig {
  role: RoleName;
  level: number;
  fullSalary: number;          // Gaji Utuh (diberikan jika memenuhi target jam duty mingguan)
  hourlyRate: number;          // Gaji Per Jam (jika tidak mencapai target jam duty mingguan)
  targetWeeklyHours: number;   // Target Jam Duty Per Minggu
  bonusStepHours: number;      // Kelipatan Jam Bonus (setiap melewati kelipatan X jam di atas target)
  bonusPerStepAmount: number;  // Nominal Bonus per Kelipatan Jam ($)
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
