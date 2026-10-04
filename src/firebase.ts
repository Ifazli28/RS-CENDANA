import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Mendukung Environment Variables Vercel (VITE_FIREBASE_*) sekaligus fallback otomatis ke firebase-applet-config.json
const resolvedConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
};

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface CloudPortalRecord {
  id: string;
  module: string;
  title: string;
  status: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
}

/**
 * Helper to persist any Portal Layanan Paramedic Cendana record to Cloud Firestore
 * while adhering strictly to the schema in firebase-blueprint.json & firestore.rules.
 */
export async function syncRecordToFirestore(
  id: string,
  moduleName: string,
  title: string,
  status: string,
  payloadData: Record<string, unknown>
) {
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const path = `portal_records/${cleanId}`;
  try {
    // Sanitize undefined fields inside payloadData so Firestore doesn't reject undefined values
    const sanitizedPayload = JSON.parse(JSON.stringify(payloadData)) as Record<string, unknown>;
    await setDoc(doc(db, 'portal_records', cleanId), {
      id: cleanId,
      module: moduleName.slice(0, 60),
      title: (title || moduleName).slice(0, 290),
      status: (status || 'Active').slice(0, 60),
      updatedAt: new Date().toISOString().slice(0, 32),
      payload: sanitizedPayload,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time listener to keep ALL public & internal staff modules in sync across devices
 * Note: Firestore 'in' operator supports max 30 values; we split into 2 queries to stay well within limits.
 */
export function subscribeToPortalRecords(
  onRecordsUpdate: (records: CloudPortalRecord[]) => void
) {
  const path = 'portal_records';
  const batch1Modules = [
    'staff_account',
    'sks_record',
    'psychology_record',
    'plastic_surgery',
    'color_blind_result',
    'appointment',
    'complaint',
    'recruitment',
    'recruitment_config',
  ];
  const batch2Modules = [
    'leave_request',
    'resign_request',
    'voting_poll',
    'doctor_schedule',
    'sop_document',
    'duty_log',
    'payroll_record',
    'regulation_item',
    'role_salary_config',
  ];

  let recordsBatch1: CloudPortalRecord[] = [];
  let recordsBatch2: CloudPortalRecord[] = [];

  const q1 = query(collection(db, path), where('module', 'in', batch1Modules));
  const q2 = query(collection(db, path), where('module', 'in', batch2Modules));

  const unsub1 = onSnapshot(
    q1,
    (snapshot) => {
      const items: CloudPortalRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CloudPortalRecord);
      });
      recordsBatch1 = items;
      onRecordsUpdate([...recordsBatch1, ...recordsBatch2]);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  const unsub2 = onSnapshot(
    q2,
    (snapshot) => {
      const items: CloudPortalRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CloudPortalRecord);
      });
      recordsBatch2 = items;
      onRecordsUpdate([...recordsBatch1, ...recordsBatch2]);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return () => {
    unsub1();
    unsub2();
  };
}
