import { auth } from './firebase';
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export const signInAnonymous = async (): Promise<User> => {
  const result = await signInAnonymously(auth);
  return result.user;
};

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const getCurrentUser = (): User | null => auth.currentUser;

export const onUserChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getDeviceType = (): 'mobile' | 'desktop' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return isMobile ? 'mobile' : 'desktop';
};

export const generateDeviceId = (): string => {
  const stored = localStorage.getItem('qd_device_id');
  if (stored) return stored;
  const id = `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  localStorage.setItem('qd_device_id', id);
  return id;
};

export const generatePairCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
