export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderNickname: string;
  senderType: 'mobile' | 'desktop' | 'unknown';
  timestamp: number;
  read: boolean;
  sessionId: string;
}

export interface Device {
  id: string;
  nickname: string;
  type: 'mobile' | 'desktop' | 'unknown';
  fcmToken?: string;
  lastSeen: number;
  online: boolean;
  sessionId: string;
}

export interface PairSession {
  id: string;
  code: string;
  devices: string[];
  createdAt: number;
  expiresAt: number;
  active: boolean;
}

export interface AppSettings {
  autoCopy: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  deviceNickname: string;
  notificationsEnabled: boolean;
}

export interface ToastData {
  id: string;
  message: Message;
  onCopy: () => void;
}

export interface TypingStatus {
  deviceId: string;
  nickname: string;
  isTyping: boolean;
  timestamp: number;
}
