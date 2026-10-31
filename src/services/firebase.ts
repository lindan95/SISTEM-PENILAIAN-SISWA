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
import { sanitizeExportPayload } from '../utils/imageCompressor';

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
    const user = result.user;
    const profilePath = `users/${user.uid}`;
    try {
      // Overwrite without merge to clear any oversized legacy payload from root user document
      await setDoc(
        doc(db, 'users', user.uid),
        {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Guru',
          photoURL: user.photoURL || '',
          updatedAt: new Date().toISOString(),
        }
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
  dataPayload: string; // JSON string of complete school dataset or chunk
}

/**
 * Save complete application dataset to Firestore under users/{userId}/appData/current
 * Safely compresses large images and chunks data if needed so document size never exceeds 1,048,576 bytes.
 */
export async function syncDataToCloud(userId: string, fullData: any): Promise<void> {
  const path = `users/${userId}/appData/current`;
  try {
    // 1. Sanitize and compress all embedded base64 photos/logos
    const sanitizedData = await sanitizeExportPayload(fullData);
    const payloadStr = JSON.stringify(sanitizedData);

    const MAX_CHUNK_SIZE = 600_000;
    const nowIso = new Date().toISOString();

    if (payloadStr.length <= MAX_CHUNK_SIZE) {
      const envelope: CloudDataEnvelope = {
        userId,
        updatedAt: nowIso,
        version: '2.0',
        dataPayload: payloadStr,
      };
      await setDoc(doc(db, 'users', userId, 'appData', 'current'), envelope);
    } else {
      // 2. Chunked payload across multiple subdocuments
      const chunks: string[] = [];
      for (let i = 0; i < payloadStr.length; i += MAX_CHUNK_SIZE) {
        chunks.push(payloadStr.slice(i, i + MAX_CHUNK_SIZE));
      }

      await Promise.all(
        chunks.map((chunk, idx) => {
          const chunkEnvelope: CloudDataEnvelope = {
            userId,
            updatedAt: nowIso,
            version: '2.0',
            dataPayload: chunk,
          };
          return setDoc(doc(db, 'users', userId, 'appData', `chunk_${idx}`), chunkEnvelope);
        })
      );

      const manifestEnvelope: CloudDataEnvelope = {
        userId,
        updatedAt: nowIso,
        version: '2.0',
        dataPayload: JSON.stringify({
          isChunked: true,
          totalChunks: chunks.length,
          totalLength: payloadStr.length,
          updatedAt: nowIso,
        }),
      };
      await setDoc(doc(db, 'users', userId, 'appData', 'current'), manifestEnvelope);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load application dataset from Firestore under users/{userId}/appData/current
 * Reassembles chunked payloads if data was split across multiple subdocuments.
 */
export async function loadDataFromCloud(userId: string): Promise<any | null> {
  const path = `users/${userId}/appData/current`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'appData', 'current'));
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data() as CloudDataEnvelope;
    if (!data || !data.dataPayload) {
      return null;
    }

    try {
      const parsed = JSON.parse(data.dataPayload);
      if (parsed && parsed.isChunked && typeof parsed.totalChunks === 'number') {
        const totalChunks = parsed.totalChunks;
        const chunkPromises: Promise<string>[] = [];
        for (let i = 0; i < totalChunks; i++) {
          chunkPromises.push(
            getDoc(doc(db, 'users', userId, 'appData', `chunk_${i}`)).then((snap) => {
              if (snap.exists()) {
                const chunkData = snap.data() as CloudDataEnvelope;
                return chunkData.dataPayload || '';
              }
              return '';
            })
          );
        }
        const chunkResults = await Promise.all(chunkPromises);
        const fullPayloadStr = chunkResults.join('');
        return JSON.parse(fullPayloadStr);
      }
      return parsed;
    } catch {
      return null;
    }
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
    async (snapshot) => {
      if (snapshot.exists()) {
        const docData = snapshot.data() as CloudDataEnvelope;
        if (docData && docData.dataPayload) {
          try {
            const parsed = JSON.parse(docData.dataPayload);
            if (parsed && parsed.isChunked && typeof parsed.totalChunks === 'number') {
              const fullData = await loadDataFromCloud(userId);
              if (fullData) {
                onDataReceived(fullData, docData.updatedAt);
              }
            } else {
              onDataReceived(parsed, docData.updatedAt);
            }
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
