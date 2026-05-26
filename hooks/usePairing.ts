'use client';
import { useState, useCallback, useEffect } from 'react';
import { createSession, findSessionByCode, joinSession, getSession } from '../lib/firestore';
import { generatePairCode } from '../lib/auth';
import { storeSessionId, getStoredSessionId } from '../lib/utils';

export const usePairing = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [pairCode, setPairCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const stored = getStoredSessionId();
    if (stored) setSessionId(stored);
  }, []);

  const createNewSession = useCallback(async (deviceId: string): Promise<{ sessionId: string; code: string }> => {
    setLoading(true);
    setError('');
    try {
      const code = generatePairCode();
      const id = await createSession(code, deviceId);
      storeSessionId(id);
      setSessionId(id);
      setPairCode(code);
      return { sessionId: id, code };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create session';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinExistingSession = useCallback(async (code: string, deviceId: string): Promise<string> => {
    setLoading(true);
    setError('');
    try {
      const session = await findSessionByCode(code);
      if (!session) throw new Error('Invalid or expired code');
      await joinSession(session.id, deviceId);
      storeSessionId(session.id);
      setSessionId(session.id);
      return session.id;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to join session';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    const stored = getStoredSessionId();
    if (!stored) return false;
    try {
      const session = await getSession(stored);
      if (!session || !session.active) return false;
      setSessionId(stored);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { sessionId, pairCode, loading, error, createNewSession, joinExistingSession, restoreSession, setError };
};
