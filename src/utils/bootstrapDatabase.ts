import {
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_DOCTOR_SCHEDULES,
  INITIAL_REGULATIONS,
  INITIAL_DUTY_LOGS,
  INITIAL_ROLE_SALARY_CONFIGS,
  INITIAL_SOP_DOCUMENTS,
} from '../data/initialData';
import { CloudPortalRecord, syncRecordToFirestore } from '../firebase';

let isBootstrappingInProgress = false;

/**
 * Checks whether foundational Portal Layanan Paramedic Kota Baru data exists in Cloud Firestore.
 * If any core module is completely missing (e.g. fresh database or new deployment),
 * it seamlessly bootstraps canonical data into Firestore so ALL devices and browsers
 * immediately share the exact same database records in real time.
 */
export async function bootstrapInitialPortalData(existingRecords: CloudPortalRecord[]): Promise<boolean> {
  if (isBootstrappingInProgress) return false;

  const hasStaff = existingRecords.some((r) => r.module === 'staff_account');
  const hasRegs = existingRecords.some((r) => r.module === 'regulation_item');
  const hasSchedules = existingRecords.some((r) => r.module === 'doctor_schedule');
  const hasDuty = existingRecords.some((r) => r.module === 'duty_log');
  const hasRoleSalaries = existingRecords.some((r) => r.module === 'role_salary_config');
  const hasSop = existingRecords.some((r) => r.module === 'sop_document');
  const hasRecConfig = existingRecords.some((r) => r.module === 'recruitment_config');

  // If all foundation modules already exist in Firestore, no bootstrap is needed
  if (hasStaff && hasRegs && hasSchedules && hasDuty && hasRoleSalaries && hasSop && hasRecConfig) {
    return false;
  }

  isBootstrappingInProgress = true;
  console.log('Bootstrapping foundational database records to Cloud Firestore...');

  try {
    // 1. Seed Staff Accounts if missing
    if (!hasStaff) {
      for (const staff of INITIAL_STAFF_ACCOUNTS) {
        await syncRecordToFirestore(staff.id, 'staff_account', staff.name, staff.status, { ...staff });
      }
    }

    // 2. Seed Regulations if missing
    if (!hasRegs) {
      for (const reg of INITIAL_REGULATIONS) {
        await syncRecordToFirestore(reg.id, 'regulation_item', reg.title, reg.category, { ...reg });
      }
    }

    // 3. Seed Doctor Schedules if missing
    if (!hasSchedules) {
      for (const sch of INITIAL_DOCTOR_SCHEDULES) {
        await syncRecordToFirestore(sch.id, 'doctor_schedule', sch.doctorName, sch.status, { ...sch });
      }
    }

    // 4. Seed Duty Logs if missing (including Deandra Aditya & Kai L Harrington)
    if (!hasDuty) {
      for (const duty of INITIAL_DUTY_LOGS) {
        await syncRecordToFirestore(duty.id, 'duty_log', duty.staffName, duty.weekKey, { ...duty });
      }
    }

    // 5. Seed Role Salary Configs if missing
    if (!hasRoleSalaries) {
      for (const cfg of INITIAL_ROLE_SALARY_CONFIGS) {
        const id = `role_sal_${cfg.role.toLowerCase().replace(/\s+/g, '_')}`;
        await syncRecordToFirestore(id, 'role_salary_config', `Skema Gaji ${cfg.role}`, 'Active', { ...cfg });
      }
    }

    // 6. Seed SOP Documents if missing
    if (!hasSop) {
      for (const sop of INITIAL_SOP_DOCUMENTS) {
        await syncRecordToFirestore(sop.id, 'sop_document', sop.title, sop.version, { ...sop });
      }
    }

    // 7. Seed Recruitment Status if missing
    if (!hasRecConfig) {
      await syncRecordToFirestore('recruitment_config_main', 'recruitment_config', 'Status Pendaftaran Paramedic', 'OPEN', {
        status: 'OPEN',
        updatedBy: 'Sistem Pusat RS Kota Baru',
      });
    }

    // 8. Write system bootstrap marker
    await syncRecordToFirestore(
      'system_bootstrap_metadata',
      'system_metadata',
      'System Database Initialized',
      'Active',
      {
        isBootstrapped: true,
        initializedAt: new Date().toISOString(),
      }
    );

    console.log('Database bootstrap completed successfully.');
    return true;
  } catch (err) {
    console.warn('Database bootstrap notice:', err);
    return false;
  } finally {
    isBootstrappingInProgress = false;
  }
}
