'use client';
import { useState, useEffect, useCallback } from 'react';
import { signInAnonymous, generateDeviceId, getDeviceType } from '../lib/auth';
import { upsertDevice, setDeviceOnline } from '../lib/firestore';
import { loadSettings } from '../lib/utils';
import { Device, AppSettings } from '../types';
import { User } from 'firebase/auth';
import { onUserChange } from '../lib/auth';

export const useDevice = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [device, setDevice] = useState<Device | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onUserChange(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    const init = async () => {
      let u = user;
      if (!u) {
        try { u = await signInAnonymous(); } catch { return; }
      }
      const id = generateDeviceId();
      const type = getDeviceType();
      const s = loadSettings();
      const nickname = s.deviceNickname || (type === 'mobile' ? '📱 Mobile' : '💻 Desktop');
      const d: Device = {
        id,
        nickname,
        type,
        lastSeen: Date.now(),
        online: true,
        sessionId: '',
      };
      setDeviceId(id);
      setDevice(d);
      setSettings(s);
      setReady(true);
    };
    if (user !== undefined) init();
  }, [user]);

  const registerDevice = useCallback(async (sessionId: string) => {
    if (!device) return;
    const updated = { ...device, sessionId };
    setDevice(updated);
    await upsertDevice({ ...updated, online: true });
  }, [device]);

  const updateNickname = useCallback(async (nickname: string, sessionId: string) => {
    if (!device) return;
    const updated = { ...device, nickname };
    setDevice(updated);
    if (sessionId) {
      await upsertDevice({ ...updated, sessionId });
    }
  }, [device]);

  return { user, deviceId, device, settings, setSettings, ready, registerDevice, updateNickname };
};
