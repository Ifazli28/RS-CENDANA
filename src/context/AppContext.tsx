import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StaffAccount,
  RoleName,
  ROLE_LEVELS,
  AccountStatus,
  DoctorSchedule,
  SKSRecord,
  PsychologyRecord,
  PlasticSurgeryRecord,
  ColorBlindResult,
  AppointmentRecord,
  ComplaintRecord,
  RecruitmentApplicant,
  VotingPoll,
  LeaveRequest,
  ResignRequest,
  SOPDocument,
  RegulationItem,
  DutyLog,
  PayrollRecord,
  ToastMessage,
} from '../types';
import {
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_DOCTOR_SCHEDULES,
  INITIAL_SKS_RECORDS,
  INITIAL_PSYCHOLOGY_RECORDS,
  INITIAL_PLASTIC_SURGERY_RECORDS,
  INITIAL_COLOR_BLIND_RESULTS,
  INITIAL_APPOINTMENTS,
  INITIAL_COMPLAINTS,
  INITIAL_RECRUITMENT_APPLICANTS,
  INITIAL_VOTING_POLLS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_RESIGN_REQUESTS,
  INITIAL_SOP_DOCUMENTS,
  INITIAL_REGULATIONS,
  INITIAL_DUTY_LOGS,
  INITIAL_PAYROLL_RECORDS,
} from '../data/initialData';
import { createStaffAvatarSvg } from '../components/BrandAssets';
import { syncRecordToFirestore, subscribeToPortalRecords } from '../firebase';

interface AppContextType {
  currentUser: StaffAccount | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  registerAccount: (name: string, email: string, password: string) => { success: boolean; message: string };
  switchDemoRole: (staffId: string) => void;
  staffAccounts: StaffAccount[];
  doctorSchedules: DoctorSchedule[];
  sksRecords: SKSRecord[];
  psychologyRecords: PsychologyRecord[];
  plasticSurgeryRecords: PlasticSurgeryRecord[];
  colorBlindResults: ColorBlindResult[];
  appointments: AppointmentRecord[];
  complaints: ComplaintRecord[];
  recruitmentStatus: 'OPEN' | 'CLOSED';
  recruitmentApplicants: RecruitmentApplicant[];
  votingPolls: VotingPoll[];
  leaveRequests: LeaveRequest[];
  resignRequests: ResignRequest[];
  sopDocuments: SOPDocument[];
  regulations: RegulationItem[];
  dutyLogs: DutyLog[];
  payrollRecords: PayrollRecord[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  submitSKS: (data: Omit<SKSRecord, 'id' | 'createdAt' | 'status'>) => void;
  submitPsychology: (data: Omit<PsychologyRecord, 'id' | 'createdAt' | 'status'>) => void;
  submitPlasticSurgery: (data: Omit<PlasticSurgeryRecord, 'id' | 'createdAt' | 'status'>) => void;
  submitColorBlindResult: (data: Omit<ColorBlindResult, 'id' | 'testDate'>) => void;
  submitAppointment: (data: Omit<AppointmentRecord, 'id' | 'createdAt' | 'status'>) => void;
  submitComplaint: (data: Omit<ComplaintRecord, 'id' | 'createdAt' | 'status'>) => void;
  submitRecruitment: (data: Omit<RecruitmentApplicant, 'id' | 'appliedAt' | 'status'>) => void;
  updateProfileAvatar: (avatarUrl: string) => void;
  updateProfileName: (name: string, bio?: string) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  changeEmail: (currentPassword: string, newEmail: string) => { success: boolean; message: string };
  approveOrRejectAccount: (accountId: string, action: 'Approve' | 'Reject') => void;
  updateStaffRoleAndInfo: (staffId: string, newRole: RoleName, newName: string, newSpecialty: string) => void;
  deactivateStaff: (staffId: string) => void;
  updateAccountStatus: (staffId: string, newStatus: AccountStatus) => void;
  deleteInactiveAccount: (staffId: string) => void;
  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'submittedAt' | 'status'>) => void;
  reviewLeaveRequest: (leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => void;
  submitResignRequest: (data: Omit<ResignRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'status'>) => void;
  reviewResignRequest: (resignId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => void;
  castVote: (pollId: string, optionId: string) => void;
  createVotingPoll: (title: string, description: string, deadline: string, optionLabels: string[]) => void;
  toggleRecruitmentStatus: (status: 'OPEN' | 'CLOSED') => void;
  updateRecruitmentApplicantStatus: (id: string, status: RecruitmentApplicant['status']) => void;
  updateComplaintStatus: (id: string, status: ComplaintRecord['status'], internalNote?: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentRecord['status']) => void;
  updateSKSStatus: (id: string, status: SKSRecord['status']) => void;
  updatePsychologyStatus: (id: string, status: PsychologyRecord['status']) => void;
  addDoctorSchedule: (data: Omit<DoctorSchedule, 'id'>) => void;
  deleteDoctorSchedule: (id: string) => void;
  addOrUpdateSOP: (sop: Omit<SOPDocument, 'id' | 'updatedAt' | 'author'>, existingId?: string) => void;
  addDutyLogsBatch: (logs: Omit<DutyLog, 'id'>[]) => void;
  addOrUpdatePayroll: (record: Omit<PayrollRecord, 'id'>, existingId?: string) => void;
  addOrUpdateRegulation: (reg: Omit<RegulationItem, 'id' | 'updatedAt' | 'updatedBy'>, existingId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() => {
    const saved = localStorage.getItem('cendana_staff_v1');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_ACCOUNTS;
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    localStorage.getItem('cendana_current_user_id_v1')
  );
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>(INITIAL_DOCTOR_SCHEDULES);
  const [sksRecords, setSksRecords] = useState<SKSRecord[]>(INITIAL_SKS_RECORDS);
  const [psychologyRecords, setPsychologyRecords] = useState<PsychologyRecord[]>(INITIAL_PSYCHOLOGY_RECORDS);
  const [plasticSurgeryRecords, setPlasticSurgeryRecords] = useState<PlasticSurgeryRecord[]>(INITIAL_PLASTIC_SURGERY_RECORDS);
  const [colorBlindResults, setColorBlindResults] = useState<ColorBlindResult[]>(INITIAL_COLOR_BLIND_RESULTS);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(INITIAL_APPOINTMENTS);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(INITIAL_COMPLAINTS);
  const [recruitmentStatus, setRecruitmentStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [recruitmentApplicants, setRecruitmentApplicants] = useState<RecruitmentApplicant[]>(INITIAL_RECRUITMENT_APPLICANTS);
  const [votingPolls, setVotingPolls] = useState<VotingPoll[]>(INITIAL_VOTING_POLLS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [resignRequests, setResignRequests] = useState<ResignRequest[]>(INITIAL_RESIGN_REQUESTS);
  const [sopDocuments, setSopDocuments] = useState<SOPDocument[]>(INITIAL_SOP_DOCUMENTS);
  const [regulations, setRegulations] = useState<RegulationItem[]>(INITIAL_REGULATIONS);
  const [dutyLogs, setDutyLogs] = useState<DutyLog[]>(INITIAL_DUTY_LOGS);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(INITIAL_PAYROLL_RECORDS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem('cendana_staff_v1', JSON.stringify(staffAccounts));
  }, [staffAccounts]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem('cendana_current_user_id_v1', currentUserId);
    else localStorage.removeItem('cendana_current_user_id_v1');
  }, [currentUserId]);

  // Real-time synchronization from Cloud Firestore across devices / Vercel deployments
  useEffect(() => {
    const unsubscribe = subscribeToPortalRecords((cloudRecords) => {
      if (!cloudRecords.length) return;

      cloudRecords.forEach((docItem) => {
        const p = docItem.payload || {};
        switch (docItem.module) {
          case 'recruitment_config': {
            if (docItem.status === 'OPEN' || docItem.status === 'CLOSED') {
              setRecruitmentStatus(docItem.status);
            }
            break;
          }
          case 'recruitment': {
            const recItem = p as unknown as RecruitmentApplicant;
            if (recItem && recItem.id) {
              setRecruitmentApplicants((prev) => {
                const exists = prev.some((x) => x.id === recItem.id);
                if (exists) {
                  return prev.map((x) =>
                    x.id === recItem.id
                      ? { ...x, ...recItem, status: (docItem.status as RecruitmentApplicant['status']) || recItem.status }
                      : x
                  );
                }
                return [recItem, ...prev];
              });
            }
            break;
          }
          case 'sks_record': {
            const sksItem = p as unknown as SKSRecord;
            if (sksItem && sksItem.id) {
              setSksRecords((prev) => {
                const exists = prev.some((x) => x.id === sksItem.id);
                if (exists) {
                  return prev.map((x) =>
                    x.id === sksItem.id
                      ? { ...x, ...sksItem, status: (docItem.status as SKSRecord['status']) || sksItem.status }
                      : x
                  );
                }
                return [sksItem, ...prev];
              });
            }
            break;
          }
          case 'psychology_record': {
            const psyItem = p as unknown as PsychologyRecord;
            if (psyItem && psyItem.id) {
              setPsychologyRecords((prev) => {
                const exists = prev.some((x) => x.id === psyItem.id);
                if (exists) {
                  return prev.map((x) =>
                    x.id === psyItem.id
                      ? { ...x, ...psyItem, status: (docItem.status as PsychologyRecord['status']) || psyItem.status }
                      : x
                  );
                }
                return [psyItem, ...prev];
              });
            }
            break;
          }
          case 'plastic_surgery': {
            const plsItem = p as unknown as PlasticSurgeryRecord;
            if (plsItem && plsItem.id) {
              setPlasticSurgeryRecords((prev) => {
                const exists = prev.some((x) => x.id === plsItem.id);
                return exists ? prev.map((x) => (x.id === plsItem.id ? { ...x, ...plsItem } : x)) : [plsItem, ...prev];
              });
            }
            break;
          }
          case 'appointment': {
            const aptItem = p as unknown as AppointmentRecord;
            if (aptItem && aptItem.id) {
              setAppointments((prev) => {
                const exists = prev.some((x) => x.id === aptItem.id);
                if (exists) {
                  return prev.map((x) =>
                    x.id === aptItem.id
                      ? { ...x, ...aptItem, status: (docItem.status as AppointmentRecord['status']) || aptItem.status }
                      : x
                  );
                }
                return [aptItem, ...prev];
              });
            }
            break;
          }
          case 'complaint': {
            const cmpItem = p as unknown as ComplaintRecord;
            if (cmpItem && cmpItem.id) {
              setComplaints((prev) => {
                const exists = prev.some((x) => x.id === cmpItem.id);
                if (exists) {
                  return prev.map((x) =>
                    x.id === cmpItem.id
                      ? { ...x, ...cmpItem, status: (docItem.status as ComplaintRecord['status']) || cmpItem.status }
                      : x
                  );
                }
                return [cmpItem, ...prev];
              });
            }
            break;
          }
          default:
            break;
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const currentUser = React.useMemo(() => {
    if (!currentUserId) return null;
    const found = staffAccounts.find((s) => s.id === currentUserId);
    if (!found || found.status !== 'Active') return null;
    return found;
  }, [currentUserId, staffAccounts]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const login = (email: string, password: string) => {
    const account = staffAccounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );
    if (!account) {
      addToast('error', 'Gagal Login', 'Email atau password tidak sesuai.');
      return { success: false, message: 'Email atau password yang Anda masukkan salah.' };
    }
    if (account.status === 'Pending Approval') {
      addToast('warning', 'Menunggu Persetujuan', 'Akun Anda masih menunggu persetujuan administrator.');
      return { success: false, message: 'Akun Anda masih menunggu persetujuan administrator.' };
    }
    if (account.status === 'Rejected') {
      addToast('error', 'Akun Ditolak', 'Pendaftaran akun Anda telah ditolak oleh administrator.');
      return { success: false, message: 'Maaf, pendaftaran akun Anda telah ditolak oleh pihak manajemen.' };
    }
    if (account.status === 'Inactive') {
      addToast('error', 'Akun Non-Aktif', 'Akun Anda berstatus Inactive dan tidak dapat mengakses portal.');
      return { success: false, message: 'Akun Anda saat ini berstatus Inactive.' };
    }
    setCurrentUserId(account.id);
    addToast('success', 'Berhasil Login', `Selamat bertugas, ${account.name} (${account.role}).`);
    return { success: true, message: 'Login berhasil.' };
  };

  const logout = () => {
    setCurrentUserId(null);
    addToast('info', 'Logout Berhasil', 'Anda telah keluar dari sesi Portal Staff.');
  };

  const registerAccount = (name: string, email: string, password: string) => {
    const exists = staffAccounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      addToast('error', 'Email Terdaftar', 'Alamat email ini sudah digunakan.');
      return { success: false, message: 'Email sudah terdaftar di sistem.' };
    }
    const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const newAcc: StaffAccount = {
      id: `st-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'Medical Support',
      level: ROLE_LEVELS['Medical Support'],
      status: 'Pending Approval',
      avatarUrl: createStaffAvatarSvg(initials || 'ST', '#E83E8C'),
      specialty: 'Anggota Baru Paramedic Cendana',
      joinDate: new Date().toISOString().slice(0, 10),
      registeredAt: new Date().toISOString().slice(0, 10),
    };
    setStaffAccounts((prev) => [newAcc, ...prev]);
    void syncRecordToFirestore(newAcc.id, 'staff_account', newAcc.name, newAcc.status, {
      email: newAcc.email,
      role: newAcc.role,
      level: newAcc.level,
      registeredAt: newAcc.registeredAt,
    });
    addToast('info', 'Registrasi Berhasil (Pending Approval)', 'Akun Anda masih menunggu persetujuan administrator.');
    return {
      success: true,
      message: 'Registrasi berhasil! Akun Anda masih menunggu persetujuan administrator.',
    };
  };

  const switchDemoRole = (staffId: string) => {
    const target = staffAccounts.find((s) => s.id === staffId);
    if (!target || target.status !== 'Active') return;
    setCurrentUserId(target.id);
    addToast('info', 'Mode Demo Role Aktif', `Beralih ke ${target.name} — ${target.role} (Level ${target.level})`);
  };

  const nowFormatted = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  const submitSKS = (data: Omit<SKSRecord, 'id' | 'createdAt' | 'status'>) => {
    const id = `sks-${Date.now()}`;
    const rec: SKSRecord = { ...data, id, createdAt: nowFormatted(), status: 'Pending' };
    setSksRecords((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'sks_record', data.fullName, 'Pending', { ...rec });
    addToast('success', 'Pengajuan SKS Berhasil', `Permohonan SKS ${data.fullName} telah disimpan ke Database.`);
  };

  const submitPsychology = (data: Omit<PsychologyRecord, 'id' | 'createdAt' | 'status'>) => {
    const id = `psy-${Date.now()}`;
    const rec: PsychologyRecord = { ...data, id, createdAt: nowFormatted(), status: 'Reviewed' };
    setPsychologyRecords((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'psychology_record', data.fullName, 'Reviewed', { ...rec });
    addToast('success', 'Pendaftaran Tes Psikologi Berhasil', `Data evaluasi ${data.fullName} tercatat di Database.`);
  };

  const submitPlasticSurgery = (data: Omit<PlasticSurgeryRecord, 'id' | 'createdAt' | 'status'>) => {
    const id = `pls-${Date.now()}`;
    const rec: PlasticSurgeryRecord = { ...data, id, createdAt: nowFormatted(), status: 'Pending Review' };
    setPlasticSurgeryRecords((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'plastic_surgery', data.fullName, 'Pending Review', { ...rec });
    addToast('success', 'Pengajuan Operasi Plastik Terkirim', `Permohonan ${data.fullName} berhasil diajukan.`);
  };

  const submitColorBlindResult = (data: Omit<ColorBlindResult, 'id' | 'testDate'>) => {
    const id = `cb-${Date.now()}`;
    const rec: ColorBlindResult = { ...data, id, testDate: nowFormatted() };
    setColorBlindResults((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'color_blind_result', data.fullName, data.category, {
      scorePercentage: data.scorePercentage,
      correctCount: data.correctCount,
      wrongCount: data.wrongCount,
      category: data.category,
    });
    addToast('success', 'Hasil Tes Buta Warna Disimpan', `Hasil tes ${data.fullName} (${data.category}) direkam ke Database.`);
  };

  const submitAppointment = (data: Omit<AppointmentRecord, 'id' | 'createdAt' | 'status'>) => {
    const id = `apt-${Date.now()}`;
    const rec: AppointmentRecord = { ...data, id, createdAt: nowFormatted(), status: 'Pending' };
    setAppointments((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'appointment', data.patientName, 'Pending', { ...rec });
    addToast('success', 'Janji Temu Berhasil Dibuat', `Jadwal temu bersama ${data.doctorName} tercatat di Database.`);
  };

  const submitComplaint = (data: Omit<ComplaintRecord, 'id' | 'createdAt' | 'status'>) => {
    const id = `cmp-${Date.now()}`;
    const rec: ComplaintRecord = { ...data, id, createdAt: nowFormatted(), status: 'Baru' };
    setComplaints((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'complaint', data.subject, 'Baru', { ...rec });
    addToast('success', 'Laporan Pengaduan Terkirim', 'Aspirasi/keluhan Anda telah diterima manajemen RS Cendana.');
  };

  const submitRecruitment = (data: Omit<RecruitmentApplicant, 'id' | 'appliedAt' | 'status'>) => {
    const id = `rec-${Date.now()}`;
    const rec: RecruitmentApplicant = { ...data, id, appliedAt: nowFormatted(), status: 'Pending' };
    setRecruitmentApplicants((prev) => [rec, ...prev]);
    void syncRecordToFirestore(id, 'recruitment', data.fullName, 'Pending', { ...rec });
    addToast('success', 'Lamaran Paramedic Terkirim', `Berkas rekrutmen ${data.fullName} berhasil dikirim ke Database.`);
  };

  const updateProfileAvatar = (avatarUrl: string) => {
    if (!currentUser) return;
    setStaffAccounts((prev) => prev.map((s) => (s.id === currentUser.id ? { ...s, avatarUrl } : s)));
    addToast('success', 'Foto Profil Diperbarui', 'Foto profil JPG Anda berhasil disimpan.');
  };

  const updateProfileName = (name: string, bio?: string) => {
    if (!currentUser) return;
    setStaffAccounts((prev) => prev.map((s) => (s.id === currentUser.id ? { ...s, name, bio: bio ?? s.bio } : s)));
    addToast('success', 'Profil Diperbarui', 'Data profil Anda berhasil diperbarui.');
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi aktif.' };
    if (currentUser.password !== currentPassword) {
      addToast('error', 'Password Salah', 'Password saat ini tidak sesuai.');
      return { success: false, message: 'Password saat ini tidak sesuai.' };
    }
    setStaffAccounts((prev) => prev.map((s) => (s.id === currentUser.id ? { ...s, password: newPassword } : s)));
    addToast('success', 'Password Diperbarui', 'Password akun Anda telah berhasil diganti.');
    return { success: true, message: 'Password berhasil diperbarui.' };
  };

  const changeEmail = (currentPassword: string, newEmail: string) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi aktif.' };
    if (currentUser.password !== currentPassword) {
      addToast('error', 'Password Salah', 'Password saat ini tidak sesuai.');
      return { success: false, message: 'Password saat ini tidak sesuai.' };
    }
    setStaffAccounts((prev) => prev.map((s) => (s.id === currentUser.id ? { ...s, email: newEmail.trim() } : s)));
    addToast('success', 'Email Diperbarui', `Email berhasil diubah menjadi ${newEmail}.`);
    return { success: true, message: 'Email berhasil diperbarui.' };
  };

  const approveOrRejectAccount = (accountId: string, action: 'Approve' | 'Reject') => {
    if (!currentUser || currentUser.level < 7 || accountId === currentUser.id) return;
    const newStatus: AccountStatus = action === 'Approve' ? 'Active' : 'Rejected';
    setStaffAccounts((prev) => prev.map((s) => (s.id === accountId ? { ...s, status: newStatus } : s)));
    addToast(action === 'Approve' ? 'success' : 'warning', `Akun ${newStatus}`, `Status akun diubah menjadi ${newStatus}.`);
  };

  const updateStaffRoleAndInfo = (staffId: string, newRole: RoleName, newName: string, newSpecialty: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const newLevel = ROLE_LEVELS[newRole];
    if (staffId === currentUser.id && newLevel > currentUser.level) {
      addToast('error', 'Akses Ditolak', 'Staff tidak dapat menaikkan role dirinya sendiri.');
      return;
    }
    setStaffAccounts((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, role: newRole, level: newLevel, name: newName, specialty: newSpecialty } : s))
    );
    setDutyLogs((prev) => prev.map((log) => (log.staffId === staffId ? { ...log, staffName: newName, role: newRole } : log)));
    setPayrollRecords((prev) => prev.map((pay) => (pay.staffId === staffId ? { ...pay, staffName: newName, role: newRole } : pay)));
    setDoctorSchedules((prev) => prev.map((sch) => (sch.doctorId === staffId ? { ...sch, doctorName: newName, doctorRole: newRole } : sch)));
    addToast('success', 'Jabatan Staff Diperbarui', `Jabatan menjadi ${newRole} (Level ${newLevel}) & RBAC diperbarui.`);
  };

  const deactivateStaff = (staffId: string) => {
    if (!currentUser || currentUser.level < 7 || staffId === currentUser.id) return;
    setStaffAccounts((prev) => prev.map((s) => (s.id === staffId ? { ...s, status: 'Inactive' } : s)));
    addToast('warning', 'Staff Dinonaktifkan', 'Status staff diubah ke Inactive. Data historis tetap aman.');
  };

  const updateAccountStatus = (staffId: string, newStatus: AccountStatus) => {
    if (!currentUser || currentUser.level < 7) return;
    setStaffAccounts((prev) => prev.map((s) => (s.id === staffId ? { ...s, status: newStatus } : s)));
    addToast('info', 'Status Akun Diperbarui', `Status akun diubah menjadi ${newStatus}.`);
  };

  const deleteInactiveAccount = (staffId: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const target = staffAccounts.find((s) => s.id === staffId);
    if (!target || target.status !== 'Inactive') return;
    setStaffAccounts((prev) => prev.filter((s) => s.id !== staffId));
    addToast('success', 'Akun Inactive Dihapus', `Akun ${target.name} dihapus. Data historis duty/payroll tetap terjaga.`);
  };

  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'submittedAt' | 'status'>) => {
    if (!currentUser) return;
    setLeaveRequests((prev) => [
      { ...data, id: `lv-${Date.now()}`, staffId: currentUser.id, staffName: currentUser.name, staffRole: currentUser.role, submittedAt: new Date().toISOString().slice(0, 10), status: 'Pending' },
      ...prev,
    ]);
    addToast('success', 'Pengajuan Cuti Terkirim', 'Permohonan cuti Anda menunggu persetujuan.');
  };

  const reviewLeaveRequest = (leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    setLeaveRequests((prev) => prev.map((lv) => (lv.id === leaveId ? { ...lv, status, rejectionReason, reviewedBy: currentUser.name } : lv)));
    addToast(status === 'Approved' ? 'success' : 'warning', `Cuti ${status}`, `Pengajuan cuti telah ${status}.`);
  };

  const submitResignRequest = (data: Omit<ResignRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'status'>) => {
    if (!currentUser) return;
    setResignRequests((prev) => [
      { ...data, id: `rsg-${Date.now()}`, staffId: currentUser.id, staffName: currentUser.name, staffRole: currentUser.role, status: 'Pending' },
      ...prev,
    ]);
    addToast('info', 'Pengajuan Resign Terkirim', 'Permohonan resign menunggu review Heads of Departments.');
  };

  const reviewResignRequest = (resignId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const target = resignRequests.find((r) => r.id === resignId);
    setResignRequests((prev) => prev.map((r) => (r.id === resignId ? { ...r, status, rejectionReason, reviewedBy: currentUser.name } : r)));
    if (status === 'Approved' && target) {
      setStaffAccounts((prev) => prev.map((s) => (s.id === target.staffId ? { ...s, status: 'Inactive' } : s)));
      addToast('success', 'Resign Disetujui', `Status ${target.staffName} menjadi Inactive. Data historis aman.`);
    } else {
      addToast('warning', 'Resign Ditolak', 'Alasan penolakan disimpan.');
    }
  };

  const castVote = (pollId: string, optionId: string) => {
    if (!currentUser) return;
    setVotingPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.options.some((o) => o.votes.includes(currentUser.id))) return poll;
        return { ...poll, options: poll.options.map((o) => (o.id === optionId ? { ...o, votes: [...o.votes, currentUser.id] } : o)) };
      })
    );
    addToast('success', 'Suara Direkam', 'Terima kasih atas suara Anda.');
  };

  const createVotingPoll = (title: string, description: string, deadline: string, optionLabels: string[]) => {
    if (!currentUser || currentUser.level < 7) return;
    setVotingPolls((prev) => [
      {
        id: `vote-${Date.now()}`,
        title,
        description,
        deadline,
        status: 'Open',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().slice(0, 10),
        options: optionLabels.map((label, idx) => ({ id: `opt-${Date.now()}-${idx}`, label, votes: [] })),
      },
      ...prev,
    ]);
    addToast('success', 'Voting Baru Dibuat', `Voting "${title}" telah dibuka.`);
  };

  const toggleRecruitmentStatus = (status: 'OPEN' | 'CLOSED') => {
    if (!currentUser || currentUser.level < 7) return;
    setRecruitmentStatus(status);
    void syncRecordToFirestore('recruitment_config_main', 'recruitment_config', 'Status Pendaftaran Paramedic', status, {
      status,
      updatedBy: currentUser.name,
    });
    addToast('info', `Rekrutmen: ${status}`, `Status pendaftaran publik diubah menjadi ${status}.`);
  };

  const updateRecruitmentApplicantStatus = (id: string, status: RecruitmentApplicant['status']) => {
    if (!currentUser || currentUser.level < 7) return;
    setRecruitmentApplicants((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status };
          void syncRecordToFirestore(id, 'recruitment', updated.fullName, status, { ...updated });
          return updated;
        }
        return a;
      })
    );
    addToast('info', 'Status Pelamar Diperbarui', `Status diubah menjadi ${status}.`);
  };

  const updateComplaintStatus = (id: string, status: ComplaintRecord['status'], internalNote?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, status, internalNote: internalNote ?? c.internalNote };
          void syncRecordToFirestore(id, 'complaint', updated.subject, status, { ...updated });
          return updated;
        }
        return c;
      })
    );
    addToast('success', 'Keluhan Diperbarui', `Status keluhan menjadi ${status}.`);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentRecord['status']) => {
    if (!currentUser || currentUser.level < 5) return;
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status };
          void syncRecordToFirestore(id, 'appointment', updated.patientName, status, { ...updated });
          return updated;
        }
        return a;
      })
    );
    addToast('info', 'Janji Temu Diperbarui', `Status diubah menjadi ${status}.`);
  };

  const updateSKSStatus = (id: string, status: SKSRecord['status']) => {
    if (!currentUser || currentUser.level < 3) return;
    setSksRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, status };
          void syncRecordToFirestore(id, 'sks_record', updated.fullName, status, { ...updated });
          return updated;
        }
        return r;
      })
    );
    addToast('success', 'Status SKS Diperbarui', `Status SKS menjadi ${status}.`);
  };

  const updatePsychologyStatus = (id: string, status: PsychologyRecord['status']) => {
    if (!currentUser || currentUser.level < 4) return;
    setPsychologyRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, status };
          void syncRecordToFirestore(id, 'psychology_record', updated.fullName, status, { ...updated });
          return updated;
        }
        return r;
      })
    );
    addToast('success', 'Status Psikologi Diperbarui', `Status menjadi ${status}.`);
  };

  const addDoctorSchedule = (data: Omit<DoctorSchedule, 'id'>) => {
    if (!currentUser || currentUser.level < 5) return;
    setDoctorSchedules((prev) => [{ ...data, id: `sch-${Date.now()}` }, ...prev]);
    addToast('success', 'Jadwal Dokter Ditambahkan', `Jadwal ${data.doctorName} tampil di halaman publik.`);
  };

  const deleteDoctorSchedule = (id: string) => {
    if (!currentUser || currentUser.level < 5) return;
    setDoctorSchedules((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Jadwal Dihapus', 'Jadwal praktik dokter dihapus.');
  };

  const addOrUpdateSOP = (sop: Omit<SOPDocument, 'id' | 'updatedAt' | 'author'>, existingId?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const updatedAt = new Date().toISOString().slice(0, 10);
    if (existingId) {
      setSopDocuments((prev) => prev.map((d) => (d.id === existingId ? { ...d, ...sop, updatedAt, author: currentUser.name } : d)));
    } else {
      setSopDocuments((prev) => [{ ...sop, id: `sop-${Date.now()}`, updatedAt, author: currentUser.name }, ...prev]);
    }
    addToast('success', 'SOP Medis Disimpan', `Dokumen "${sop.title}" telah disimpan.`);
  };

  const addDutyLogsBatch = (logs: Omit<DutyLog, 'id'>[]) => {
    if (!currentUser || currentUser.level < 7) return;
    const created: DutyLog[] = logs.map((l, idx) => ({ ...l, id: `duty-${Date.now()}-${idx}` }));
    setDutyLogs((prev) => [...created, ...prev]);
    addToast('success', 'Log Duty Disimpan', `${created.length} sesi duty ditambahkan ke Rekap & Leaderboard.`);
  };

  const addOrUpdatePayroll = (record: Omit<PayrollRecord, 'id'>, existingId?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    if (existingId) {
      setPayrollRecords((prev) => prev.map((p) => (p.id === existingId ? { ...record, id: existingId } : p)));
    } else {
      setPayrollRecords((prev) => [{ ...record, id: `pay-${Date.now()}` }, ...prev]);
    }
    addToast('success', 'Payroll Disimpan', `Skema gaji ${record.staffName} berhasil disimpan.`);
  };

  const addOrUpdateRegulation = (reg: Omit<RegulationItem, 'id' | 'updatedAt' | 'updatedBy'>, existingId?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const updatedAt = new Date().toISOString().slice(0, 10);
    if (existingId) {
      setRegulations((prev) => prev.map((r) => (r.id === existingId ? { ...r, ...reg, updatedAt, updatedBy: currentUser.name } : r)));
    } else {
      setRegulations((prev) => [{ ...reg, id: `reg-${Date.now()}`, updatedAt, updatedBy: currentUser.name }, ...prev]);
    }
    addToast('success', 'Regulasi Diperbarui', `Regulasi "${reg.title}" telah disimpan.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        registerAccount,
        switchDemoRole,
        staffAccounts,
        doctorSchedules,
        sksRecords,
        psychologyRecords,
        plasticSurgeryRecords,
        colorBlindResults,
        appointments,
        complaints,
        recruitmentStatus,
        recruitmentApplicants,
        votingPolls,
        leaveRequests,
        resignRequests,
        sopDocuments,
        regulations,
        dutyLogs,
        payrollRecords,
        toasts,
        addToast,
        removeToast,
        submitSKS,
        submitPsychology,
        submitPlasticSurgery,
        submitColorBlindResult,
        submitAppointment,
        submitComplaint,
        submitRecruitment,
        updateProfileAvatar,
        updateProfileName,
        changePassword,
        changeEmail,
        approveOrRejectAccount,
        updateStaffRoleAndInfo,
        deactivateStaff,
        updateAccountStatus,
        deleteInactiveAccount,
        submitLeaveRequest,
        reviewLeaveRequest,
        submitResignRequest,
        reviewResignRequest,
        castVote,
        createVotingPoll,
        toggleRecruitmentStatus,
        updateRecruitmentApplicantStatus,
        updateComplaintStatus,
        updateAppointmentStatus,
        updateSKSStatus,
        updatePsychologyStatus,
        addDoctorSchedule,
        deleteDoctorSchedule,
        addOrUpdateSOP,
        addDutyLogsBatch,
        addOrUpdatePayroll,
        addOrUpdateRegulation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
