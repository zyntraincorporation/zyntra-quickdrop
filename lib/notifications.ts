import { getFirebaseMessaging } from './firebase';
import { registerServiceWorker } from './service-worker';
import { Message } from '../types';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';

export { registerServiceWorker } from './service-worker';

const isNotificationSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;

  if (window.Notification.permission === 'granted') return true;
  if (window.Notification.permission === 'denied') return false;

  const permission = await window.Notification.requestPermission();
  return permission === 'granted';
};

export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !VAPID_KEY) return null;
  if (!('serviceWorker' in navigator)) return null;

  try {
    const msg = await getFirebaseMessaging();
    if (!msg) return null;

    const reg = await registerServiceWorker();
    if (!reg) return null;

    const { getToken } = await import('firebase/messaging');
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg,
    });
    return token || null;
  } catch {
    return null;
  }
};

export const setupFCMListener = (callback: (msg: Message) => void): (() => void) => {
  let active = true;
  let unsubscribe: (() => void) | undefined;

  void getFirebaseMessaging().then(async msg => {
    try {
      if (!msg) return;
      const { onMessage } = await import('firebase/messaging');
      if (!active) return;

      unsubscribe = onMessage(msg, (payload) => {
        const data = payload.data as Record<string, string> | undefined;
        if (data?.messageId) {
          callback({
            id: data.messageId,
            text: data.text || '',
            senderId: data.senderId || '',
            senderNickname: data.senderNickname || 'Unknown',
            senderType: (data.senderType as Message['senderType']) || 'unknown',
            timestamp: parseInt(data.timestamp || '0'),
            read: false,
            sessionId: data.sessionId || '',
          });
        }
      });
    } catch {
      // Foreground push is optional; Firestore listeners remain the source of truth.
    }
  });

  return () => {
    active = false;
    unsubscribe?.();
  };
};

export const showLocalNotification = (title: string, body: string, onClick?: () => void): void => {
  if (!isNotificationSupported()) return;
  if (window.Notification.permission !== 'granted') return;

  const notification = new window.Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    tag: 'quickdrop-message',
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
};
