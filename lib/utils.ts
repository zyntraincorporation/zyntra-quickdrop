import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppSettings } from '../types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const truncate = (text: string, len = 60): string =>
  text.length > len ? text.slice(0, len) + '…' : text;

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch {
    return false;
  }
};

export const pasteFromClipboard = async (): Promise<string> => {
  try {
    if (navigator.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
    return '';
  } catch {
    return '';
  }
};

export const vibrate = (pattern: number | number[] = 50): void => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const playSound = (type: 'send' | 'receive' | 'copy'): void => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const configs: Record<string, { freq: number; type: OscillatorType; duration: number }> = {
      send: { freq: 880, type: 'sine', duration: 0.12 },
      receive: { freq: 660, type: 'sine', duration: 0.18 },
      copy: { freq: 1100, type: 'triangle', duration: 0.08 },
    };
    const c = configs[type];
    osc.frequency.value = c.freq;
    osc.type = c.type;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);
    osc.start();
    osc.stop(ctx.currentTime + c.duration);
  } catch {}
};

export const DEFAULT_SETTINGS: AppSettings = {
  autoCopy: false,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
  deviceNickname: '',
  notificationsEnabled: true,
};

export const loadSettings = (): AppSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('qd_settings');
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem('qd_settings', JSON.stringify(settings));
};

export const getStoredSessionId = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('qd_session_id') : null;

export const storeSessionId = (id: string): void =>
  localStorage.setItem('qd_session_id', id);

export const clearStoredSession = (): void => {
  localStorage.removeItem('qd_session_id');
  localStorage.removeItem('qd_device_id');
};
