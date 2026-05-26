'use client';
import { useState, useEffect } from 'react';
import { setDeviceOnline } from '../lib/firestore';

export const useOnlineStatus = (deviceId: string, sessionId: string) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const onOnline = () => {
      setIsOnline(true);
      if (deviceId && sessionId) void setDeviceOnline(deviceId, true);
    };
    const onOffline = () => {
      setIsOnline(false);
      if (deviceId && sessionId) void setDeviceOnline(deviceId, false);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [deviceId, sessionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!deviceId || !sessionId) return;
    void setDeviceOnline(deviceId, true);
    const handleUnload = () => {
      void setDeviceOnline(deviceId, false);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      void setDeviceOnline(deviceId, false);
    };
  }, [deviceId, sessionId]);

  return isOnline;
};
