'use client';
import { useState, useEffect } from 'react';
import { setDeviceOnline } from '../lib/firestore';

export const useOnlineStatus = (deviceId: string, sessionId: string) => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      if (deviceId && sessionId) setDeviceOnline(deviceId, true);
    };
    const onOffline = () => {
      setIsOnline(false);
      if (deviceId && sessionId) setDeviceOnline(deviceId, false);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [deviceId, sessionId]);

  useEffect(() => {
    if (!deviceId || !sessionId) return;
    setDeviceOnline(deviceId, true);
    const handleUnload = () => setDeviceOnline(deviceId, false);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      setDeviceOnline(deviceId, false);
    };
  }, [deviceId, sessionId]);

  return isOnline;
};
