import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operational Types for Strict Error Handling
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
): never {
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

// Connection Validation
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

// Authentication Functions
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Upsert user profile
    const user = result.user;
    const profilePath = `users/${user.uid}`;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Guru',
          photoURL: user.photoURL || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, profilePath);
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Cloud Data Sync Methods for Multi-Device Access
export interface CloudDataEnvelope {
  userId: string;
  updatedAt: string;
  version: string;
  dataPayload: string; // JSON string of complete school dataset
}

/**
 * Save complete application dataset to Firestore under users/{userId}/appData/current
 */
export async function syncDataToCloud(userId: string, fullData: any): Promise<void> {
  const path = `users/${userId}/appData/current`;
  try {
    const payloadStr = JSON.stringify(fullData);
    const envelope: CloudDataEnvelope = {
      userId,
      updatedAt: new Date().toISOString(),
      version: '2.0',
      dataPayload: payloadStr,
    };
    await setDoc(doc(db, 'users', userId, 'appData', 'current'), envelope);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load application dataset from Firestore under users/{userId}/appData/current
 */
export async function loadDataFromCloud(userId: string): Promise<any | null> {
  const path = `users/${userId}/appData/current`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'appData', 'current'));
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data() as CloudDataEnvelope;
    if (data && data.dataPayload) {
      return JSON.parse(data.dataPayload);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Real-time listener for multi-device sync
 */
export function listenToCloudData(
  userId: string,
  onDataReceived: (data: any, updatedAt: string) => void
): () => void {
  const path = `users/${userId}/appData/current`;
  const unsub = onSnapshot(
    doc(db, 'users', userId, 'appData', 'current'),
    (snapshot) => {
      if (snapshot.exists()) {
        const docData = snapshot.data() as CloudDataEnvelope;
        if (docData && docData.dataPayload) {
          try {
            const parsed = JSON.parse(docData.dataPayload);
            onDataReceived(parsed, docData.updatedAt);
          } catch (e) {
            console.error('Failed to parse incoming cloud payload', e);
          }
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
  return unsub;
}
