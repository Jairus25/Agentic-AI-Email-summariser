import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

const provider = new GoogleAuthProvider();
provider.addScope(GMAIL_READONLY_SCOPE);
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Flag to indicate if we are currently opening sign-in popup
let isSigningIn = false;
// In-memory token caching
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in via Firebase session but token not cached in this memory context yet
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export interface GoogleAuthResult {
  user: User | null;
  accessToken: string | null;
  cancelled?: boolean;
  error?: string | null;
  isAccessDenied?: boolean;
}

export const googleSignIn = async (): Promise<GoogleAuthResult> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      return {
        user: null,
        accessToken: null,
        error: 'Failed to retrieve access token from Google sign in'
      };
    }
    cachedAccessToken = credential.accessToken;
    return { 
      user: result.user, 
      accessToken: cachedAccessToken,
      cancelled: false,
      error: null
    };
  } catch (error: any) {
    const code = error?.code || '';
    const message = error?.message || '';

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      // Normal user action - popup was dismissed before completion
      console.info('Google sign-in popup was closed by user.');
      return {
        user: null,
        accessToken: null,
        cancelled: true,
        error: null
      };
    }

    if (code === 'auth/popup-blocked') {
      console.warn('Google sign-in popup was blocked by browser.');
      return {
        user: null,
        accessToken: null,
        cancelled: false,
        error: 'Popup was blocked by the browser. Please allow popups or open the app in a new window.'
      };
    }

    const isAccessDenied = 
      message.toLowerCase().includes('access_denied') ||
      message.toLowerCase().includes('verification') ||
      code === 'auth/unauthorized-domain' ||
      code === 'auth/operation-not-allowed';

    // Informative warning for other authentication issues
    console.warn('Google sign-in incomplete:', message || code);
    return {
      user: null,
      accessToken: null,
      cancelled: false,
      isAccessDenied,
      error: isAccessDenied 
        ? 'Google access blocked (Error 403): app is in testing mode. Only approved test users can sign in.'
        : message || 'Failed to complete sign-in.'
    };
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
