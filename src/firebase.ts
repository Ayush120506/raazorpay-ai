import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  Firestore 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { FailedPayment } from './types';

export { firebaseConfig };

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSyFakeKey'
);

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore with configured databaseId
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export interface MerchantUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isDemo?: boolean;
}

// Google Sign-In with Firebase Auth
export async function loginWithGoogle(): Promise<MerchantUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const merchantUser: MerchantUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Merchant',
      photoURL: user.photoURL,
      isDemo: false
    };

    // Persist/Update merchant profile in Firestore
    try {
      await setDoc(doc(db, 'merchants', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: new Date().toISOString(),
        role: 'merchant_admin'
      }, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore] Note: Could not sync merchant document to Firestore:', fsErr);
    }

    localStorage.setItem('checkout_rescue_user', JSON.stringify(merchantUser));
    return merchantUser;
  } catch (error: any) {
    console.error('[Firebase Auth] Google Sign-In Error:', error);
    throw error;
  }
}

// Email/Password Login with auto-registration fallback
export async function loginWithEmail(email: string, pass: string): Promise<MerchantUser> {
  try {
    let userCred;
    try {
      userCred = await signInWithEmailAndPassword(auth, email, pass);
    } catch (signInErr: any) {
      if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
        // Try creating user account
        userCred = await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        throw signInErr;
      }
    }

    const user = userCred.user;
    const merchantUser: MerchantUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      isDemo: false
    };

    try {
      await setDoc(doc(db, 'merchants', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: merchantUser.displayName,
        lastLoginAt: new Date().toISOString(),
        role: 'merchant_admin'
      }, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore] Error writing merchant doc:', fsErr);
    }

    localStorage.setItem('checkout_rescue_user', JSON.stringify(merchantUser));
    return merchantUser;
  } catch (error: any) {
    console.error('[Firebase Auth] Email Login Error:', error);
    throw error;
  }
}

// 1-Click Quick Demo Login for testing
export async function loginDemoUser(): Promise<MerchantUser> {
  const demoUser: MerchantUser = {
    uid: 'demo_merchant_stylehub',
    email: 'store.admin@stylehub.store',
    displayName: 'Aman (StyleHub Store)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isDemo: true
  };
  localStorage.setItem('checkout_rescue_user', JSON.stringify(demoUser));
  return demoUser;
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('[Firebase Auth] Sign out warning:', err);
  }
  localStorage.removeItem('checkout_rescue_user');
}

export function getStoredUser(): MerchantUser | null {
  try {
    const raw = localStorage.getItem('checkout_rescue_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Firestore Persistence for Failed Payments & Recovery States
export function subscribeToFirestorePayments(
  onUpdate: (payments: FailedPayment[]) => void,
  initialFallbackPayments: FailedPayment[]
): () => void {
  try {
    const colRef = collection(db, 'failed_payments');
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: FailedPayment[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as FailedPayment);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(list);
      } else {
        // Seed initial mock payments if collection is currently empty
        seedInitialPayments(initialFallbackPayments);
        onUpdate(initialFallbackPayments);
      }
    }, (error) => {
      console.warn('[Firestore] onSnapshot error, using server/local data:', error);
      onUpdate(initialFallbackPayments);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Error subscribing to failed_payments:', err);
    onUpdate(initialFallbackPayments);
    return () => {};
  }
}

async function seedInitialPayments(items: FailedPayment[]) {
  try {
    for (const item of items) {
      await setDoc(doc(db, 'failed_payments', item.id), item, { merge: true });
    }
    console.log('[Firestore] Seeded initial recovery payment records');
  } catch (err) {
    console.warn('[Firestore] Could not seed initial payments (may require auth):', err);
  }
}

export async function persistPaymentToFirestore(payment: FailedPayment): Promise<void> {
  try {
    await setDoc(doc(db, 'failed_payments', payment.id), payment, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Error saving payment to Firestore:', err);
  }
}

export async function updatePaymentStatusInFirestore(
  paymentId: string, 
  updates: Partial<FailedPayment>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'failed_payments', paymentId), updates);
  } catch (err) {
    console.warn('[Firestore] Error updating payment in Firestore:', err);
  }
}
