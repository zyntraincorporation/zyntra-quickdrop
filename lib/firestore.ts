import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Message, Device, PairSession, TypingStatus } from '../types';

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const createSession = async (code: string, deviceId: string): Promise<string> => {
  const ref = doc(collection(db, 'sessions'));
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await setDoc(ref, {
    code,
    devices: [deviceId],
    createdAt: Date.now(),
    expiresAt,
    active: true,
  });
  return ref.id;
};

export const findSessionByCode = async (code: string): Promise<PairSession | null> => {
  const q = query(
    collection(db, 'sessions'),
    where('code', '==', code.toUpperCase()),
    where('active', '==', true),
    where('expiresAt', '>', Date.now()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PairSession;
};

export const joinSession = async (sessionId: string, deviceId: string): Promise<void> => {
  const ref = doc(db, 'sessions', sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Session not found');
  const data = snap.data() as PairSession;
  if (data.devices.includes(deviceId)) return;
  if (data.devices.length >= 2) throw new Error('Session full');
  await updateDoc(ref, {
    devices: [...data.devices, deviceId],
  });
};

export const getSession = async (sessionId: string): Promise<PairSession | null> => {
  const snap = await getDoc(doc(db, 'sessions', sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PairSession;
};

// ─── Devices ──────────────────────────────────────────────────────────────────

export const upsertDevice = async (device: Partial<Device> & { id: string }): Promise<void> => {
  const ref = doc(db, 'devices', device.id);
  await setDoc(ref, { ...device, lastSeen: Date.now() }, { merge: true });
};

export const setDeviceOnline = async (deviceId: string, online: boolean): Promise<void> => {
  const ref = doc(db, 'devices', deviceId);
  await setDoc(ref, { online, lastSeen: Date.now() }, { merge: true });
};

export const subscribeToDevices = (
  sessionId: string,
  callback: (devices: Device[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'devices'),
    where('sessionId', '==', sessionId)
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const devices = snap.docs.map(d => ({ id: d.id, ...d.data() } as Device));
    callback(devices);
  });
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const sendMessage = async (
  sessionId: string,
  msg: Omit<Message, 'id'>
): Promise<string> => {
  const ref = await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
    ...msg,
    timestamp: Date.now(),
    read: false,
  });
  return ref.id;
};

export const subscribeToMessages = (
  sessionId: string,
  callback: (messages: Message[]) => void,
  limitCount = 50
): Unsubscribe => {
  const q = query(
    collection(db, 'sessions', sessionId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
    callback(messages);
  });
};

export const markMessageRead = async (sessionId: string, messageId: string): Promise<void> => {
  const ref = doc(db, 'sessions', sessionId, 'messages', messageId);
  await updateDoc(ref, { read: true });
};

export const deleteMessage = async (sessionId: string, messageId: string): Promise<void> => {
  await deleteDoc(doc(db, 'sessions', sessionId, 'messages', messageId));
};

export const clearMessages = async (sessionId: string): Promise<void> => {
  const snap = await getDocs(collection(db, 'sessions', sessionId, 'messages'));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

// ─── Typing ───────────────────────────────────────────────────────────────────

export const setTyping = async (
  sessionId: string,
  deviceId: string,
  nickname: string,
  isTyping: boolean
): Promise<void> => {
  const ref = doc(db, 'sessions', sessionId, 'typing', deviceId);
  await setDoc(ref, { deviceId, nickname, isTyping, timestamp: Date.now() });
};

export const subscribeToTyping = (
  sessionId: string,
  myDeviceId: string,
  callback: (status: TypingStatus | null) => void
): Unsubscribe => {
  return onSnapshot(
    collection(db, 'sessions', sessionId, 'typing'),
    (snap: QuerySnapshot<DocumentData>) => {
      const now = Date.now();
      const active = snap.docs
        .map(d => d.data() as TypingStatus)
        .find(t => t.deviceId !== myDeviceId && t.isTyping && now - t.timestamp < 5000);
      callback(active || null);
    }
  );
};
