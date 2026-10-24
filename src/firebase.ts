import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
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
 * Helper to persist any Portal Layanan Paramedic Kota Baru record to Cloud Firestore
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
 * Helper to delete a Portal Record from Cloud Firestore
 */
export async function deleteRecordFromFirestore(id: string) {
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  try {
    await deleteDoc(doc(db, 'portal_records', cleanId));
  } catch (error) {
    // Non-fatal if record does not exist on cloud or client is temporarily offline
    console.warn(`Cloud Firestore delete skipped or offline for ${cleanId}:`, error);
  }
}

/**
 * Unified Real-time listener to keep ALL public & internal staff modules in sync across all devices
 */
export function subscribeToPortalRecords(
  onRecordsUpdate: (records: CloudPortalRecord[]) => void
): () => void {
  const path = 'portal_records';
  const q = query(collection(db, path));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: CloudPortalRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CloudPortalRecord);
      });
      onRecordsUpdate(items);
    },
    (error) => {
      console.warn('Real-time listener notice for portal_records:', error);
    }
  );

  return unsubscribe;
}
