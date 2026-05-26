import { getFirebaseMessaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { upsertDevice } from './firestore';
import { Message } from '../types';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const msg = await getFirebaseMessaging();
    if (!msg) return null;

    const reg = await navigator.serviceWorker.ready;
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
  let unsubscribe = () => {};
  getFirebaseMessaging().then(msg => {
    if (!msg) return;
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
  });
  return () => unsubscribe();
};

export const showLocalNotification = (title: string, body: string, onClick?: () => void): void => {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, {
  body,
  icon: '/icons/icon-192.png',
  badge: '/icons/badge-72x72.png',
  tag: 'quickdrop-message',
} as NotificationOptions);

if (onClick) n.onclick = onClick;
};
