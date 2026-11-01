import { CloudPortalRecord } from '../firebase';

/**
 * Auto-seeding / bootstrapping is permanently disabled per user mandate.
 * The user's live data in Cloud Firestore is the sole source of truth and must NEVER
 * be automatically overwritten, populated with dummy records, or reset.
 */
export async function bootstrapInitialPortalData(_existingRecords?: CloudPortalRecord[]): Promise<boolean> {
  // Permanently disabled: No auto-seeding or dummy record injection.
  return false;
}
