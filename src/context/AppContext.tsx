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
  RoleSalaryConfig,
  SKWBClaim,
  SKWBPaketSedangClaim,
  SKWBPatientCardClaim,
  SKWBOplasClaim,
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
  INITIAL_ROLE_SALARY_CONFIGS,
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
  roleSalaryConfigs: RoleSalaryConfig[];
  skwbClaims: SKWBClaim[];
  skwbPaketSedangClaims: SKWBPaketSedangClaim[];
  skwbPatientCardClaims: SKWBPatientCardClaim[];
  skwbOplasClaims: SKWBOplasClaim[];
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
  deleteStaffAccount: (staffId: string) => void;
  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'submittedAt' | 'status'>) => void;
  reviewLeaveRequest: (leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => void;
  submitResignRequest: (data: Omit<ResignRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'status'>) => void;
  reviewResignRequest: (resignId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => void;
  castVote: (pollId: string, optionId: string) => void;
  createVotingPoll: (title: string, description: string, deadline: string, optionLabels: string[]) => void;
  deleteVotingPoll: (pollId: string) => void;
  toggleRecruitmentStatus: (status: 'OPEN' | 'CLOSED') => void;
  updateRecruitmentApplicantStatus: (id: string, status: RecruitmentApplicant['status']) => void;
  updateComplaintStatus: (id: string, status: ComplaintRecord['status'], internalNote?: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentRecord['status']) => void;
  updateSKSStatus: (id: string, status: SKSRecord['status']) => void;
  updatePsychologyStatus: (id: string, status: PsychologyRecord['status']) => void;
  updatePlasticSurgeryStatus: (
    id: string,
    status: PlasticSurgeryRecord['status'],
    handlingDoctorName: string
  ) => void;
  addDoctorSchedule: (data: Omit<DoctorSchedule, 'id'>) => void;
  deleteDoctorSchedule: (id: string) => void;
  addOrUpdateSOP: (sop: Omit<SOPDocument, 'id' | 'updatedAt' | 'author'>, existingId?: string) => void;
  addDutyLogsBatch: (logs: Omit<DutyLog, 'id'>[]) => void;
  addOrUpdatePayroll: (record: Omit<PayrollRecord, 'id'>, existingId?: string) => void;
  updateRoleSalaryConfig: (config: RoleSalaryConfig) => void;
  addOrUpdateRegulation: (reg: Omit<RegulationItem, 'id' | 'updatedAt' | 'updatedBy'>, existingId?: string) => void;
  submitSKWBClaim: (data: {
    icName: string;
    birthDate: string;
    issueDate: string;
    photoFileName: string;
    photoFileSize: number;
    photoDataUrl: string;
  }) => { success: boolean; claim?: SKWBClaim; message: string };
  claimSKWBPaketSedang: (skwbClaimId: string, handlingStaffId: string) => { success: boolean; message: string };
  claimSKWBPatientCard: (skwbClaimId: string, handlingStaffId: string) => { success: boolean; message: string };
  claimSKWBOplas: (skwbClaimId: string, handlingStaffId: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(() =>
    loadLocal('cendana_staff_v1', INITIAL_STAFF_ACCOUNTS)
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    localStorage.getItem('cendana_current_user_id_v1')
  );
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>(() =>
    loadLocal('cendana_schedules_v1', INITIAL_DOCTOR_SCHEDULES)
  );
  const [sksRecords, setSksRecords] = useState<SKSRecord[]>(() =>
    loadLocal('cendana_sks_v1', INITIAL_SKS_RECORDS)
  );
  const [psychologyRecords, setPsychologyRecords] = useState<PsychologyRecord[]>(() =>
    loadLocal('cendana_psy_v1', INITIAL_PSYCHOLOGY_RECORDS)
  );
  const [plasticSurgeryRecords, setPlasticSurgeryRecords] = useState<PlasticSurgeryRecord[]>(() =>
    loadLocal('cendana_pls_v1', INITIAL_PLASTIC_SURGERY_RECORDS)
  );
  const [colorBlindResults, setColorBlindResults] = useState<ColorBlindResult[]>(() =>
    loadLocal('cendana_cb_v1', INITIAL_COLOR_BLIND_RESULTS)
  );
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() =>
    loadLocal('cendana_apt_v1', INITIAL_APPOINTMENTS)
  );
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(() =>
    loadLocal('cendana_cmp_v1', INITIAL_COMPLAINTS)
  );
  const [recruitmentStatus, setRecruitmentStatus] = useState<'OPEN' | 'CLOSED'>(() =>
    loadLocal('cendana_rec_status_v1', 'OPEN')
  );
  const [recruitmentApplicants, setRecruitmentApplicants] = useState<RecruitmentApplicant[]>(() =>
    loadLocal('cendana_rec_app_v1', INITIAL_RECRUITMENT_APPLICANTS)
  );
  const [votingPolls, setVotingPolls] = useState<VotingPoll[]>(() =>
    loadLocal('cendana_votes_v1', INITIAL_VOTING_POLLS)
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    loadLocal('cendana_leaves_v1', INITIAL_LEAVE_REQUESTS)
  );
  const [resignRequests, setResignRequests] = useState<ResignRequest[]>(() =>
    loadLocal('cendana_resigns_v1', INITIAL_RESIGN_REQUESTS)
  );
  const [sopDocuments, setSopDocuments] = useState<SOPDocument[]>(() =>
    loadLocal('cendana_sops_v1', INITIAL_SOP_DOCUMENTS)
  );
  const [regulations, setRegulations] = useState<RegulationItem[]>(() =>
    loadLocal('cendana_regs_v1', INITIAL_REGULATIONS)
  );
  const [dutyLogs, setDutyLogs] = useState<DutyLog[]>(() =>
    loadLocal('cendana_duties_v1', INITIAL_DUTY_LOGS)
  );
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() =>
    loadLocal('cendana_payrolls_v1', INITIAL_PAYROLL_RECORDS)
  );
  const [roleSalaryConfigs, setRoleSalaryConfigs] = useState<RoleSalaryConfig[]>(() =>
    loadLocal('cendana_role_salaries_v1', INITIAL_ROLE_SALARY_CONFIGS)
  );
  // SKWB Benefit records — 100% centralized in Cloud Firestore (no localStorage or mock arrays)
  const [skwbClaims, setSkwbClaims] = useState<SKWBClaim[]>([]);
  const [skwbPaketSedangClaims, setSkwbPaketSedangClaims] = useState<SKWBPaketSedangClaim[]>([]);
  const [skwbPatientCardClaims, setSkwbPatientCardClaims] = useState<SKWBPatientCardClaim[]>([]);
  const [skwbOplasClaims, setSkwbOplasClaims] = useState<SKWBOplasClaim[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage persistence for all modules
  useEffect(() => {
    localStorage.setItem('cendana_staff_v1', JSON.stringify(staffAccounts));
  }, [staffAccounts]);
  useEffect(() => {
    localStorage.setItem('cendana_schedules_v1', JSON.stringify(doctorSchedules));
  }, [doctorSchedules]);
  useEffect(() => {
    localStorage.setItem('cendana_sks_v1', JSON.stringify(sksRecords));
  }, [sksRecords]);
  useEffect(() => {
    localStorage.setItem('cendana_psy_v1', JSON.stringify(psychologyRecords));
  }, [psychologyRecords]);
  useEffect(() => {
    localStorage.setItem('cendana_pls_v1', JSON.stringify(plasticSurgeryRecords));
  }, [plasticSurgeryRecords]);
  useEffect(() => {
    localStorage.setItem('cendana_cb_v1', JSON.stringify(colorBlindResults));
  }, [colorBlindResults]);
  useEffect(() => {
    localStorage.setItem('cendana_apt_v1', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('cendana_cmp_v1', JSON.stringify(complaints));
  }, [complaints]);
  useEffect(() => {
    localStorage.setItem('cendana_rec_status_v1', JSON.stringify(recruitmentStatus));
  }, [recruitmentStatus]);
  useEffect(() => {
    localStorage.setItem('cendana_rec_app_v1', JSON.stringify(recruitmentApplicants));
  }, [recruitmentApplicants]);
  useEffect(() => {
    localStorage.setItem('cendana_votes_v1', JSON.stringify(votingPolls));
  }, [votingPolls]);
  useEffect(() => {
    localStorage.setItem('cendana_leaves_v1', JSON.stringify(leaveRequests));
  }, [leaveRequests]);
  useEffect(() => {
    localStorage.setItem('cendana_resigns_v1', JSON.stringify(resignRequests));
  }, [resignRequests]);
  useEffect(() => {
    localStorage.setItem('cendana_sops_v1', JSON.stringify(sopDocuments));
  }, [sopDocuments]);
  useEffect(() => {
    localStorage.setItem('cendana_regs_v1', JSON.stringify(regulations));
  }, [regulations]);
  useEffect(() => {
    localStorage.setItem('cendana_duties_v1', JSON.stringify(dutyLogs));
  }, [dutyLogs]);
  useEffect(() => {
    localStorage.setItem('cendana_payrolls_v1', JSON.stringify(payrollRecords));
  }, [payrollRecords]);
  useEffect(() => {
    localStorage.setItem('cendana_role_salaries_v1', JSON.stringify(roleSalaryConfigs));
  }, [roleSalaryConfigs]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem('cendana_current_user_id_v1', currentUserId);
    else localStorage.removeItem('cendana_current_user_id_v1');
  }, [currentUserId]);

  // Real-time synchronization from Cloud Firestore across all public & internal staff modules
  useEffect(() => {
    const unsubscribe = subscribeToPortalRecords((cloudRecords) => {
      if (!cloudRecords.length) return;

      cloudRecords.forEach((docItem) => {
        const p = docItem.payload || {};
        switch (docItem.module) {
          case 'staff_account': {
            const stItem = p as unknown as StaffAccount;
            if (stItem && stItem.id) {
              if (docItem.status === 'DELETED') {
                setStaffAccounts((prev) => prev.filter((x) => x.id !== stItem.id));
              } else {
                setStaffAccounts((prev) => {
                  const exists = prev.some((x) => x.id === stItem.id);
                  if (exists) {
                    return prev.map((x) => (x.id === stItem.id ? { ...x, ...stItem } : x));
                  }
                  return [stItem, ...prev];
                });
              }
            }
            break;
          }
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
                      ? {
                          ...x,
                          ...recItem,
                          status: (docItem.status as RecruitmentApplicant['status']) || recItem.status,
                        }
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
                      ? {
                          ...x,
                          ...psyItem,
                          status: (docItem.status as PsychologyRecord['status']) || psyItem.status,
                        }
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
                return exists
                  ? prev.map((x) => (x.id === plsItem.id ? { ...x, ...plsItem } : x))
                  : [plsItem, ...prev];
              });
            }
            break;
          }
          case 'color_blind_result': {
            const cbItem = p as unknown as ColorBlindResult;
            if (cbItem && cbItem.id) {
              setColorBlindResults((prev) => {
                const exists = prev.some((x) => x.id === cbItem.id);
                return exists
                  ? prev.map((x) => (x.id === cbItem.id ? { ...x, ...cbItem } : x))
                  : [cbItem, ...prev];
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
                      ? {
                          ...x,
                          ...aptItem,
                          status: (docItem.status as AppointmentRecord['status']) || aptItem.status,
                        }
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
                      ? {
                          ...x,
                          ...cmpItem,
                          status: (docItem.status as ComplaintRecord['status']) || cmpItem.status,
                        }
                      : x
                  );
                }
                return [cmpItem, ...prev];
              });
            }
            break;
          }
          case 'leave_request': {
            const lvItem = p as unknown as LeaveRequest;
            if (lvItem && lvItem.id) {
              setLeaveRequests((prev) => {
                const exists = prev.some((x) => x.id === lvItem.id);
                return exists
                  ? prev.map((x) => (x.id === lvItem.id ? { ...x, ...lvItem } : x))
                  : [lvItem, ...prev];
              });
            }
            break;
          }
          case 'resign_request': {
            const rsgItem = p as unknown as ResignRequest;
            if (rsgItem && rsgItem.id) {
              setResignRequests((prev) => {
                const exists = prev.some((x) => x.id === rsgItem.id);
                return exists
                  ? prev.map((x) => (x.id === rsgItem.id ? { ...x, ...rsgItem } : x))
                  : [rsgItem, ...prev];
              });
            }
            break;
          }
          case 'voting_poll': {
            const pollItem = p as unknown as VotingPoll;
            if (pollItem && pollItem.id) {
              if (docItem.status === 'DELETED') {
                setVotingPolls((prev) => prev.filter((x) => x.id !== pollItem.id));
              } else {
                setVotingPolls((prev) => {
                  const exists = prev.some((x) => x.id === pollItem.id);
                  return exists
                    ? prev.map((x) => (x.id === pollItem.id ? { ...x, ...pollItem } : x))
                    : [pollItem, ...prev];
                });
              }
            }
            break;
          }
          case 'doctor_schedule': {
            const schItem = p as unknown as DoctorSchedule;
            if (schItem && schItem.id) {
              if (docItem.status === 'DELETED') {
                setDoctorSchedules((prev) => prev.filter((x) => x.id !== schItem.id));
              } else {
                setDoctorSchedules((prev) => {
                  const exists = prev.some((x) => x.id === schItem.id);
                  return exists
                    ? prev.map((x) => (x.id === schItem.id ? { ...x, ...schItem } : x))
                    : [schItem, ...prev];
                });
              }
            }
            break;
          }
          case 'sop_document': {
            const sopItem = p as unknown as SOPDocument;
            if (sopItem && sopItem.id) {
              setSopDocuments((prev) => {
                const exists = prev.some((x) => x.id === sopItem.id);
                return exists
                  ? prev.map((x) => (x.id === sopItem.id ? { ...x, ...sopItem } : x))
                  : [sopItem, ...prev];
              });
            }
            break;
          }
          case 'duty_log': {
            const dutyItem = p as unknown as DutyLog;
            if (dutyItem && dutyItem.id) {
              setDutyLogs((prev) => {
                const exists = prev.some((x) => x.id === dutyItem.id);
                return exists
                  ? prev.map((x) => (x.id === dutyItem.id ? { ...x, ...dutyItem } : x))
                  : [dutyItem, ...prev];
              });
            }
            break;
          }
          case 'payroll_record': {
            const payItem = p as unknown as PayrollRecord;
            if (payItem && payItem.id) {
              setPayrollRecords((prev) => {
                const exists = prev.some((x) => x.id === payItem.id);
                return exists
                  ? prev.map((x) => (x.id === payItem.id ? { ...x, ...payItem } : x))
                  : [payItem, ...prev];
              });
            }
            break;
          }
          case 'regulation_item': {
            const regItem = p as unknown as RegulationItem;
            if (regItem && regItem.id) {
              setRegulations((prev) => {
                const exists = prev.some((x) => x.id === regItem.id);
                return exists
                  ? prev.map((x) => (x.id === regItem.id ? { ...x, ...regItem } : x))
                  : [regItem, ...prev];
              });
            }
            break;
          }
          case 'role_salary_config': {
            const roleCfg = p as unknown as RoleSalaryConfig;
            if (roleCfg && roleCfg.role) {
              setRoleSalaryConfigs((prev) => {
                const exists = prev.some((x) => x.role === roleCfg.role);
                return exists
                  ? prev.map((x) => (x.role === roleCfg.role ? { ...x, ...roleCfg } : x))
                  : [roleCfg, ...prev];
              });
            }
            break;
          }
          case 'skwb_claim': {
            const skwbItem = p as unknown as SKWBClaim;
            if (skwbItem && skwbItem.id) {
              setSkwbClaims((prev) => {
                const exists = prev.some((x) => x.id === skwbItem.id);
                return exists
                  ? prev.map((x) => (x.id === skwbItem.id ? { ...x, ...skwbItem } : x))
                  : [skwbItem, ...prev];
              });
            }
            break;
          }
          case 'skwb_paket_sedang_claim': {
            const pktItem = p as unknown as SKWBPaketSedangClaim;
            if (pktItem && pktItem.id) {
              setSkwbPaketSedangClaims((prev) => {
                const exists = prev.some((x) => x.id === pktItem.id);
                return exists
                  ? prev.map((x) => (x.id === pktItem.id ? { ...x, ...pktItem } : x))
                  : [pktItem, ...prev];
              });
            }
            break;
          }
          case 'skwb_kartu_pasien_claim': {
            const kpItem = p as unknown as SKWBPatientCardClaim;
            if (kpItem && kpItem.id) {
              setSkwbPatientCardClaims((prev) => {
                const exists = prev.some((x) => x.id === kpItem.id);
                return exists
                  ? prev.map((x) => (x.id === kpItem.id ? { ...x, ...kpItem } : x))
                  : [kpItem, ...prev];
              });
            }
            break;
          }
          case 'skwb_oplas_claim': {
            const opItem = p as unknown as SKWBOplasClaim;
            if (opItem && opItem.id) {
              setSkwbOplasClaims((prev) => {
                const exists = prev.some((x) => x.id === opItem.id);
                return exists
                  ? prev.map((x) => (x.id === opItem.id ? { ...x, ...opItem } : x))
                  : [opItem, ...prev];
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
    void syncRecordToFirestore(newAcc.id, 'staff_account', newAcc.name, newAcc.status, { ...newAcc });
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
    void syncRecordToFirestore(id, 'color_blind_result', data.fullName, data.category, { ...rec });
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
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === currentUser.id) {
          const updated = { ...s, avatarUrl };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast('success', 'Foto Profil Diperbarui', 'Foto profil Anda berhasil disimpan ke Database.');
  };

  const updateProfileName = (name: string, bio?: string) => {
    if (!currentUser) return;
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === currentUser.id) {
          const updated = { ...s, name, bio: bio ?? s.bio };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast('success', 'Profil Diperbarui', 'Data profil Anda berhasil diperbarui di Database.');
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi aktif.' };
    if (currentUser.password !== currentPassword) {
      addToast('error', 'Password Salah', 'Password saat ini tidak sesuai.');
      return { success: false, message: 'Password saat ini tidak sesuai.' };
    }
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === currentUser.id) {
          const updated = { ...s, password: newPassword };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast('success', 'Password Diperbarui', 'Password akun Anda telah berhasil diganti di Database.');
    return { success: true, message: 'Password berhasil diperbarui.' };
  };

  const changeEmail = (currentPassword: string, newEmail: string) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi aktif.' };
    if (currentUser.password !== currentPassword) {
      addToast('error', 'Password Salah', 'Password saat ini tidak sesuai.');
      return { success: false, message: 'Password saat ini tidak sesuai.' };
    }
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === currentUser.id) {
          const updated = { ...s, email: newEmail.trim() };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast('success', 'Email Diperbarui', `Email berhasil diubah menjadi ${newEmail} di Database.`);
    return { success: true, message: 'Email berhasil diperbarui.' };
  };

  const approveOrRejectAccount = (accountId: string, action: 'Approve' | 'Reject') => {
    if (!currentUser || currentUser.level < 7 || accountId === currentUser.id) return;
    const newStatus: AccountStatus = action === 'Approve' ? 'Active' : 'Rejected';
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === accountId) {
          const updated = { ...s, status: newStatus };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast(action === 'Approve' ? 'success' : 'warning', `Akun ${newStatus}`, `Status akun diubah menjadi ${newStatus} di Database.`);
  };

  const updateStaffRoleAndInfo = (staffId: string, newRole: RoleName, newName: string, newSpecialty: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const newLevel = ROLE_LEVELS[newRole];
    if (staffId === currentUser.id && newLevel > currentUser.level) {
      addToast('error', 'Akses Ditolak', 'Staff tidak dapat menaikkan role dirinya sendiri.');
      return;
    }
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const updated = { ...s, role: newRole, level: newLevel, name: newName, specialty: newSpecialty };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    setDutyLogs((prev) => prev.map((log) => (log.staffId === staffId ? { ...log, staffName: newName, role: newRole } : log)));
    setPayrollRecords((prev) => prev.map((pay) => (pay.staffId === staffId ? { ...pay, staffName: newName, role: newRole } : pay)));
    setDoctorSchedules((prev) => prev.map((sch) => (sch.doctorId === staffId ? { ...sch, doctorName: newName, doctorRole: newRole } : sch)));
    addToast('success', 'Jabatan Staff Diperbarui', `Jabatan menjadi ${newRole} (Level ${newLevel}) & RBAC diperbarui di Database.`);
  };

  const deactivateStaff = (staffId: string) => {
    if (!currentUser || currentUser.level < 7 || staffId === currentUser.id) return;
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const updated: StaffAccount = { ...s, status: 'Inactive' };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast('warning', 'Staff Dinonaktifkan', 'Status staff diubah ke Inactive di Database. Data historis tetap aman.');
  };

  const updateAccountStatus = (staffId: string, newStatus: AccountStatus) => {
    if (!currentUser || currentUser.level < 7) return;
    setStaffAccounts((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const updated = { ...s, status: newStatus };
          void syncRecordToFirestore(updated.id, 'staff_account', updated.name, updated.status, { ...updated });
          return updated;
        }
        return s;
      })
    );
    addToast('info', 'Status Akun Diperbarui', `Status akun diubah menjadi ${newStatus} di Database.`);
  };

  const deleteInactiveAccount = (staffId: string) => {
    if (!currentUser || currentUser.level < 7) return;
    if (staffId === currentUser.id) {
      addToast('error', 'Akses Ditolak', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif login.');
      return;
    }
    const target = staffAccounts.find((s) => s.id === staffId);
    if (!target) return;
    setStaffAccounts((prev) => prev.filter((s) => s.id !== staffId));
    void syncRecordToFirestore(target.id, 'staff_account', target.name, 'DELETED', { id: target.id });
    addToast('success', 'Akun Staff Dihapus', `Data & akun ${target.name} berhasil dihapus dari Database.`);
  };

  const deleteStaffAccount = (staffId: string) => {
    deleteInactiveAccount(staffId);
  };

  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'submittedAt' | 'status'>) => {
    if (!currentUser) return;
    const id = `lv-${Date.now()}`;
    const newLeave: LeaveRequest = {
      ...data,
      id,
      staffId: currentUser.id,
      staffName: currentUser.name,
      staffRole: currentUser.role,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
    void syncRecordToFirestore(id, 'leave_request', `${currentUser.name} - ${data.leaveType}`, 'Pending', { ...newLeave });
    addToast('success', 'Pengajuan Cuti Terkirim', 'Permohonan cuti Anda tersimpan di Database & menunggu persetujuan.');
  };

  const reviewLeaveRequest = (leaveId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    setLeaveRequests((prev) =>
      prev.map((lv) => {
        if (lv.id === leaveId) {
          const updated = { ...lv, status, rejectionReason, reviewedBy: currentUser.name };
          void syncRecordToFirestore(leaveId, 'leave_request', `${updated.staffName} - ${updated.leaveType}`, status, {
            ...updated,
          });
          return updated;
        }
        return lv;
      })
    );
    addToast(status === 'Approved' ? 'success' : 'warning', `Cuti ${status}`, `Pengajuan cuti telah ${status} di Database.`);
  };

  const submitResignRequest = (data: Omit<ResignRequest, 'id' | 'staffId' | 'staffName' | 'staffRole' | 'status'>) => {
    if (!currentUser) return;
    const id = `rsg-${Date.now()}`;
    const newResign: ResignRequest = {
      ...data,
      id,
      staffId: currentUser.id,
      staffName: currentUser.name,
      staffRole: currentUser.role,
      status: 'Pending',
    };
    setResignRequests((prev) => [newResign, ...prev]);
    void syncRecordToFirestore(id, 'resign_request', `Resign - ${currentUser.name}`, 'Pending', { ...newResign });
    addToast('info', 'Pengajuan Resign Terkirim', 'Permohonan resign tersimpan di Database & menunggu review Heads.');
  };

  const reviewResignRequest = (resignId: string, status: 'Approved' | 'Rejected', rejectionReason?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const target = resignRequests.find((r) => r.id === resignId);
    setResignRequests((prev) =>
      prev.map((r) => {
        if (r.id === resignId) {
          const updated = { ...r, status, rejectionReason, reviewedBy: currentUser.name };
          void syncRecordToFirestore(resignId, 'resign_request', `Resign - ${updated.staffName}`, status, { ...updated });
          return updated;
        }
        return r;
      })
    );
    if (status === 'Approved' && target) {
      setStaffAccounts((prev) =>
        prev.map((s) => {
          if (s.id === target.staffId) {
            const updatedStaff: StaffAccount = { ...s, status: 'Inactive' };
            void syncRecordToFirestore(updatedStaff.id, 'staff_account', updatedStaff.name, 'Inactive', { ...updatedStaff });
            return updatedStaff;
          }
          return s;
        })
      );
      addToast('success', 'Resign Disetujui', `Status ${target.staffName} menjadi Inactive di Database. Data historis aman.`);
    } else {
      addToast('warning', 'Resign Ditolak', 'Alasan penolakan disimpan ke Database.');
    }
  };

  const castVote = (pollId: string, optionId: string) => {
    if (!currentUser) return;
    setVotingPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.options.some((o) => o.votes.includes(currentUser.id))) return poll;
        const updated: VotingPoll = {
          ...poll,
          options: poll.options.map((o) => (o.id === optionId ? { ...o, votes: [...o.votes, currentUser.id] } : o)),
        };
        void syncRecordToFirestore(updated.id, 'voting_poll', updated.title, updated.status, { ...updated });
        return updated;
      })
    );
    addToast('success', 'Suara Direkam', 'Suara Anda telah disimpan ke Database.');
  };

  const createVotingPoll = (title: string, description: string, deadline: string, optionLabels: string[]) => {
    if (!currentUser || currentUser.level < 7) return;
    const id = `vote-${Date.now()}`;
    const newPoll: VotingPoll = {
      id,
      title,
      description,
      deadline,
      status: 'Open',
      createdBy: currentUser.name,
      createdAt: new Date().toISOString().slice(0, 10),
      options: optionLabels.map((label, idx) => ({ id: `opt-${Date.now()}-${idx}`, label, votes: [] })),
    };
    setVotingPolls((prev) => [newPoll, ...prev]);
    void syncRecordToFirestore(id, 'voting_poll', title, 'Open', { ...newPoll });
    addToast('success', 'Voting Baru Dibuat', `Voting "${title}" telah dibuka dan disimpan di Database.`);
  };

  const deleteVotingPoll = (pollId: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const target = votingPolls.find((p) => p.id === pollId);
    setVotingPolls((prev) => prev.filter((p) => p.id !== pollId));
    void syncRecordToFirestore(pollId, 'voting_poll', target?.title || pollId, 'DELETED', { id: pollId });
    addToast('info', 'Voting Dihapus', `Voting "${target?.title || ''}" berhasil dihapus dari Database.`);
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

  const updatePlasticSurgeryStatus = (
    id: string,
    status: PlasticSurgeryRecord['status'],
    handlingDoctorName: string
  ) => {
    if (!currentUser || currentUser.level < 5) return;
    const approvedAt = nowFormatted();
    setPlasticSurgeryRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated: PlasticSurgeryRecord = {
            ...r,
            status,
            handlingDoctorName: handlingDoctorName.trim() || currentUser.name,
            approvedAt,
          };
          void syncRecordToFirestore(id, 'plastic_surgery', updated.fullName, status, { ...updated });
          return updated;
        }
        return r;
      })
    );
    addToast(
      'success',
      `Pengajuan Operasi Plastik: ${status}`,
      `Ditangani oleh ${handlingDoctorName.trim() || currentUser.name} & tersimpan ke Database.`
    );
  };

  const addDoctorSchedule = (data: Omit<DoctorSchedule, 'id'>) => {
    if (!currentUser || currentUser.level < 5) return;
    const id = `sch-${Date.now()}`;
    const newSch: DoctorSchedule = { ...data, id };
    setDoctorSchedules((prev) => [newSch, ...prev]);
    void syncRecordToFirestore(id, 'doctor_schedule', data.doctorName, data.status, { ...newSch });
    addToast('success', 'Jadwal Dokter Ditambahkan', `Jadwal ${data.doctorName} tersimpan di Database & tampil di publik.`);
  };

  const deleteDoctorSchedule = (id: string) => {
    if (!currentUser || currentUser.level < 5) return;
    setDoctorSchedules((prev) => prev.filter((s) => s.id !== id));
    void syncRecordToFirestore(id, 'doctor_schedule', id, 'DELETED', { id });
    addToast('info', 'Jadwal Dihapus', 'Jadwal praktik dokter dihapus dari Database.');
  };

  const addOrUpdateSOP = (sop: Omit<SOPDocument, 'id' | 'updatedAt' | 'author'>, existingId?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const updatedAt = new Date().toISOString().slice(0, 10);
    if (existingId) {
      setSopDocuments((prev) =>
        prev.map((d) => {
          if (d.id === existingId) {
            const updated: SOPDocument = { ...d, ...sop, updatedAt, author: currentUser.name };
            void syncRecordToFirestore(existingId, 'sop_document', updated.title, updated.version, { ...updated });
            return updated;
          }
          return d;
        })
      );
    } else {
      const id = `sop-${Date.now()}`;
      const newSop: SOPDocument = { ...sop, id, updatedAt, author: currentUser.name };
      setSopDocuments((prev) => [newSop, ...prev]);
      void syncRecordToFirestore(id, 'sop_document', newSop.title, newSop.version, { ...newSop });
    }
    addToast('success', 'SOP Medis Disimpan', `Dokumen "${sop.title}" telah disimpan ke Database.`);
  };

  const addDutyLogsBatch = (logs: Omit<DutyLog, 'id'>[]) => {
    if (!currentUser || currentUser.level < 7) return;
    const created: DutyLog[] = logs.map((l, idx) => ({ ...l, id: `duty-${Date.now()}-${idx}` }));
    setDutyLogs((prev) => [...created, ...prev]);
    created.forEach((dutyItem) => {
      void syncRecordToFirestore(dutyItem.id, 'duty_log', dutyItem.staffName, dutyItem.weekKey, { ...dutyItem });
    });
    addToast('success', 'Log Duty Disimpan', `${created.length} sesi duty disimpan ke Database, Rekap & Leaderboard.`);
  };

  const addOrUpdatePayroll = (record: Omit<PayrollRecord, 'id'>, existingId?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    if (existingId) {
      setPayrollRecords((prev) =>
        prev.map((p) => {
          if (p.id === existingId) {
            const updated: PayrollRecord = { ...record, id: existingId };
            void syncRecordToFirestore(existingId, 'payroll_record', updated.staffName, updated.paymentStatus, {
              ...updated,
            });
            return updated;
          }
          return p;
        })
      );
    } else {
      const id = `pay-${Date.now()}`;
      const newPay: PayrollRecord = { ...record, id };
      setPayrollRecords((prev) => [newPay, ...prev]);
      void syncRecordToFirestore(id, 'payroll_record', newPay.staffName, newPay.paymentStatus, { ...newPay });
    }
    addToast('success', 'Payroll Disimpan', `Skema gaji ${record.staffName} berhasil disimpan ke Database.`);
  };

  const updateRoleSalaryConfig = (config: RoleSalaryConfig) => {
    if (!currentUser || currentUser.level < 7) return;
    setRoleSalaryConfigs((prev) =>
      prev.map((c) => (c.role === config.role ? { ...config } : c))
    );
    const id = `role_sal_${config.role.toLowerCase().replace(/\s+/g, '_')}`;
    void syncRecordToFirestore(id, 'role_salary_config', `Skema Gaji ${config.role}`, 'Active', {
      ...config,
    });
    addToast(
      'success',
      'Skema Gaji Jabatan Diperbarui',
      `Pengaturan gaji, target jam mingguan (${config.targetWeeklyHours}j), & bonus ${config.role} tersimpan ke Database.`
    );
  };

  const addOrUpdateRegulation = (reg: Omit<RegulationItem, 'id' | 'updatedAt' | 'updatedBy'>, existingId?: string) => {
    if (!currentUser || currentUser.level < 7) return;
    const updatedAt = new Date().toISOString().slice(0, 10);
    if (existingId) {
      setRegulations((prev) =>
        prev.map((r) => {
          if (r.id === existingId) {
            const updated: RegulationItem = { ...r, ...reg, updatedAt, updatedBy: currentUser.name };
            void syncRecordToFirestore(existingId, 'regulation_item', updated.title, updated.category, { ...updated });
            return updated;
          }
          return r;
        })
      );
    } else {
      const id = `reg-${Date.now()}`;
      const newReg: RegulationItem = { ...reg, id, updatedAt, updatedBy: currentUser.name };
      setRegulations((prev) => [newReg, ...prev]);
      void syncRecordToFirestore(id, 'regulation_item', newReg.title, newReg.category, { ...newReg });
    }
    addToast('success', 'Regulasi Diperbarui', `Regulasi "${reg.title}" telah disimpan ke Database.`);
  };

  // Helper: Calculate SKWB End Date = Issue Date + 7 days (YYYY-MM-DD)
  const calculateSKWBEndDate = (issueDateStr: string): string => {
    const parts = issueDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return issueDateStr;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() + 7);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper: Check whether SKWB is currently Active based on issueDate + 7 days
  const isSKWBCurrentlyActive = (issueDateStr: string, endDateStr: string): boolean => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const computedEnd = endDateStr || calculateSKWBEndDate(issueDateStr);
    return todayStr <= computedEnd;
  };

  const submitSKWBClaim = (data: {
    icName: string;
    birthDate: string;
    issueDate: string;
    photoFileName: string;
    photoFileSize: number;
    photoDataUrl: string;
  }) => {
    if (!data.icName.trim() || !data.birthDate || !data.issueDate || !data.photoDataUrl) {
      addToast('error', 'Data Tidak Valid', 'Seluruh kolom dan foto SKWB wajib dilengkapi.');
      return { success: false, message: 'Data tidak lengkap.' };
    }

    const startDate = data.issueDate;
    const endDate = calculateSKWBEndDate(data.issueDate);
    const active = isSKWBCurrentlyActive(startDate, endDate);
    const status: 'Aktif' | 'Kadaluarsa' = active ? 'Aktif' : 'Kadaluarsa';
    const nowStr = nowFormatted();
    const id = `skwb-${Date.now()}`;

    const newClaim: SKWBClaim = {
      id,
      icName: data.icName.trim(),
      birthDate: data.birthDate,
      issueDate: data.issueDate,
      startDate,
      endDate,
      photoFileName: data.photoFileName,
      photoFileSize: data.photoFileSize,
      photoDataUrl: data.photoDataUrl,
      status,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    setSkwbClaims((prev) => [newClaim, ...prev]);
    void syncRecordToFirestore(id, 'skwb_claim', newClaim.icName, status, { ...newClaim });
    addToast(
      'success',
      'Klaim Benefit SKWB Berhasil Disimpan',
      `Data SKWB ${newClaim.icName} berlaku s/d ${endDate} telah tersimpan di Database.`
    );
    return { success: true, claim: newClaim, message: 'Pengajuan Benefit SKWB berhasil disimpan.' };
  };

  // Benefit 1: Paket Sedang (Obat dan Perban) — 1x per hari selama aktif, Staff minimal Co-ass (Level >= 4)
  const claimSKWBPaketSedang = (skwbClaimId: string, handlingStaffId: string) => {
    if (!currentUser || currentUser.level < 3) {
      addToast('error', 'Akses Ditolak', 'Anda tidak memiliki hak akses untuk memproses Benefit SKWB.');
      return { success: false, message: 'Anda tidak memiliki hak akses.' };
    }

    const skwb = skwbClaims.find((c) => c.id === skwbClaimId);
    if (!skwb) {
      addToast('error', 'Data Tidak Ditemukan', 'Data SKWB warga tidak ditemukan.');
      return { success: false, message: 'Data SKWB tidak ditemukan.' };
    }

    // 1. Cek apakah SKWB masih berlaku (Tanggal Terbit + 7 hari)
    if (!isSKWBCurrentlyActive(skwb.issueDate, skwb.endDate)) {
      addToast(
        'error',
        'Benefit Kadaluarsa',
        'Klaim tidak dapat dilakukan karena masa berlaku SKWB telah berakhir.'
      );
      return {
        success: false,
        message: 'Klaim tidak dapat dilakukan karena masa berlaku SKWB telah berakhir.',
      };
    }

    // 2. Cek apakah warga sudah melakukan klaim Paket Sedang hari ini
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const alreadyClaimedToday = skwbPaketSedangClaims.some(
      (c) => c.skwbClaimId === skwbClaimId && c.claimDate === todayDate
    );
    if (alreadyClaimedToday) {
      addToast('warning', 'Sudah Diklaim Hari Ini', 'Paket Sedang sudah diklaim untuk hari ini.');
      return { success: false, message: 'Paket Sedang sudah diklaim untuk hari ini.' };
    }

    // 3. Cek apakah staff yang menangani sudah dipilih
    if (!handlingStaffId) {
      addToast('error', 'Staff Wajib Dipilih', 'Staff yang menangani wajib dipilih.');
      return { success: false, message: 'Staff yang menangani wajib dipilih.' };
    }

    // 4. Cek apakah staff aktif dan memiliki role Co-ass ke atas (Level >= 4)
    const staff = staffAccounts.find((s) => s.id === handlingStaffId && s.status === 'Active');
    if (!staff || staff.level < ROLE_LEVELS['Co-ass']) {
      addToast(
        'error',
        'Kewenangan Tidak Sesuai',
        'Staff tersebut tidak memiliki kewenangan untuk menangani klaim ini.'
      );
      return {
        success: false,
        message: 'Staff tersebut tidak memiliki kewenangan untuk menangani klaim ini.',
      };
    }

    const claimTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const id = `skwb_pkt_${Date.now()}`;
    const record: SKWBPaketSedangClaim = {
      id,
      skwbClaimId,
      claimDate: todayDate,
      claimTime,
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      status: 'Claimed',
      createdAt: nowFormatted(),
    };

    setSkwbPaketSedangClaims((prev) => [record, ...prev]);
    void syncRecordToFirestore(
      id,
      'skwb_paket_sedang_claim',
      `Paket Sedang - ${skwb.icName} (${todayDate})`,
      'Claimed',
      { ...record }
    );
    addToast(
      'success',
      'Klaim Paket Sedang Berhasil',
      `Paket Sedang (${skwb.icName}) berhasil diklaim dan ditangani oleh ${staff.name} (${staff.role}).`
    );
    return { success: true, message: 'Klaim Paket Sedang berhasil disimpan.' };
  };

  // Benefit 2: Diskon 50% Pembuatan Kartu Pasien — 1x sepanjang SKWB, Staff minimal Paramedic (Level >= 3)
  const claimSKWBPatientCard = (skwbClaimId: string, handlingStaffId: string) => {
    if (!currentUser || currentUser.level < 3) {
      addToast('error', 'Akses Ditolak', 'Anda tidak memiliki hak akses untuk memproses Benefit SKWB.');
      return { success: false, message: 'Anda tidak memiliki hak akses.' };
    }

    const skwb = skwbClaims.find((c) => c.id === skwbClaimId);
    if (!skwb) {
      addToast('error', 'Data Tidak Ditemukan', 'Data SKWB warga tidak ditemukan.');
      return { success: false, message: 'Data SKWB tidak ditemukan.' };
    }

    // 1. Cek masa berlaku SKWB
    if (!isSKWBCurrentlyActive(skwb.issueDate, skwb.endDate)) {
      addToast('error', 'Benefit Kadaluarsa', 'Benefit SKWB sudah tidak berlaku.');
      return { success: false, message: 'Benefit SKWB sudah tidak berlaku.' };
    }

    // 2. Cek apakah belum pernah diklaim
    const alreadyClaimed = skwbPatientCardClaims.some((c) => c.skwbClaimId === skwbClaimId);
    if (alreadyClaimed) {
      addToast(
        'warning',
        'Sudah Pernah Digunakan',
        'Diskon 50% pembuatan kartu pasien sudah pernah digunakan.'
      );
      return {
        success: false,
        message: 'Diskon 50% pembuatan kartu pasien sudah pernah digunakan.',
      };
    }

    // 3. Cek staff yang menangani (Paramedic ke atas, Level >= 3)
    if (!handlingStaffId) {
      addToast('error', 'Staff Wajib Dipilih', 'Staff yang membuatkan kartu pasien wajib dipilih.');
      return { success: false, message: 'Staff yang membuatkan kartu pasien wajib dipilih.' };
    }

    const staff = staffAccounts.find((s) => s.id === handlingStaffId && s.status === 'Active');
    if (!staff || staff.level < ROLE_LEVELS['Paramedic']) {
      addToast(
        'error',
        'Kewenangan Tidak Sesuai',
        'Staff harus memiliki jabatan minimal Paramedic ke atas.'
      );
      return {
        success: false,
        message: 'Staff harus memiliki jabatan minimal Paramedic ke atas.',
      };
    }

    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const claimTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const id = `skwb_kp_${Date.now()}`;
    const record: SKWBPatientCardClaim = {
      id,
      skwbClaimId,
      claimDate: todayDate,
      claimTime,
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      status: 'Claimed',
      createdAt: nowFormatted(),
    };

    setSkwbPatientCardClaims((prev) => [record, ...prev]);
    void syncRecordToFirestore(
      id,
      'skwb_kartu_pasien_claim',
      `Diskon 50% Kartu Pasien - ${skwb.icName}`,
      'Claimed',
      { ...record }
    );
    addToast(
      'success',
      'Klaim Diskon 50% Kartu Pasien Berhasil',
      `Benefit Kartu Pasien (${skwb.icName}) berhasil diklaim oleh ${staff.name} (${staff.role}).`
    );
    return { success: true, message: 'Klaim Diskon 50% Kartu Pasien berhasil disimpan.' };
  };

  // Benefit 3: Free 1x Oplas — 1x sepanjang SKWB, Staff minimal Doctor (Level >= 5)
  const claimSKWBOplas = (skwbClaimId: string, handlingStaffId: string) => {
    if (!currentUser || currentUser.level < 3) {
      addToast('error', 'Akses Ditolak', 'Anda tidak memiliki hak akses untuk memproses Benefit SKWB.');
      return { success: false, message: 'Anda tidak memiliki hak akses.' };
    }

    const skwb = skwbClaims.find((c) => c.id === skwbClaimId);
    if (!skwb) {
      addToast('error', 'Data Tidak Ditemukan', 'Data SKWB warga tidak ditemukan.');
      return { success: false, message: 'Data SKWB tidak ditemukan.' };
    }

    // 1. Cek masa berlaku SKWB
    if (!isSKWBCurrentlyActive(skwb.issueDate, skwb.endDate)) {
      addToast('error', 'Benefit Kadaluarsa', 'Benefit SKWB sudah tidak berlaku.');
      return { success: false, message: 'Benefit SKWB sudah tidak berlaku.' };
    }

    // 2. Cek apakah belum pernah diklaim
    const alreadyClaimed = skwbOplasClaims.some((c) => c.skwbClaimId === skwbClaimId);
    if (alreadyClaimed) {
      addToast('warning', 'Sudah Pernah Digunakan', 'Free 1x Oplas sudah pernah digunakan.');
      return { success: false, message: 'Free 1x Oplas sudah pernah digunakan.' };
    }

    // 3. Cek staff yang menangani (Doctor ke atas, Level >= 5)
    if (!handlingStaffId) {
      addToast('error', 'Staff Wajib Dipilih', 'Staff dokter yang menangani wajib dipilih.');
      return { success: false, message: 'Staff dokter yang menangani wajib dipilih.' };
    }

    const staff = staffAccounts.find((s) => s.id === handlingStaffId && s.status === 'Active');
    if (!staff || staff.level < ROLE_LEVELS['Doctor']) {
      addToast(
        'error',
        'Kewenangan Tidak Sesuai',
        'Staff harus memiliki jabatan minimal Doctor ke atas.'
      );
      return {
        success: false,
        message: 'Staff harus memiliki jabatan minimal Doctor ke atas.',
      };
    }

    const now = new Date();
    const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const claimTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const id = `skwb_op_${Date.now()}`;
    const record: SKWBOplasClaim = {
      id,
      skwbClaimId,
      claimDate: todayDate,
      claimTime,
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      status: 'Claimed',
      createdAt: nowFormatted(),
    };

    setSkwbOplasClaims((prev) => [record, ...prev]);
    void syncRecordToFirestore(
      id,
      'skwb_oplas_claim',
      `Free 1x Oplas - ${skwb.icName}`,
      'Claimed',
      { ...record }
    );
    addToast(
      'success',
      'Klaim Free 1x Oplas Berhasil',
      `Benefit Free 1x Oplas (${skwb.icName}) berhasil diklaim dan ditangani oleh ${staff.name} (${staff.role}).`
    );
    return { success: true, message: 'Klaim Free 1x Oplas berhasil disimpan.' };
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
        roleSalaryConfigs,
        skwbClaims,
        skwbPaketSedangClaims,
        skwbPatientCardClaims,
        skwbOplasClaims,
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
        deleteStaffAccount,
        submitLeaveRequest,
        reviewLeaveRequest,
        submitResignRequest,
        reviewResignRequest,
        castVote,
        createVotingPoll,
        deleteVotingPoll,
        toggleRecruitmentStatus,
        updateRecruitmentApplicantStatus,
        updateComplaintStatus,
        updateAppointmentStatus,
        updateSKSStatus,
        updatePsychologyStatus,
        updatePlasticSurgeryStatus,
        addDoctorSchedule,
        deleteDoctorSchedule,
        addOrUpdateSOP,
        addDutyLogsBatch,
        addOrUpdatePayroll,
        updateRoleSalaryConfig,
        addOrUpdateRegulation,
        submitSKWBClaim,
        claimSKWBPaketSedang,
        claimSKWBPatientCard,
        claimSKWBOplas,
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
