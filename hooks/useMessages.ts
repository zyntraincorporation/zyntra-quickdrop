'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  subscribeToMessages,
  sendMessage as fsendMessage,
  deleteMessage,
  clearMessages,
  setTyping,
  subscribeToTyping,
} from '../lib/firestore';
import { Message, TypingStatus } from '../types';
import { playSound, vibrate, loadSettings } from '../lib/utils';

export const useMessages = (sessionId: string, deviceId: string, nickname: string, senderType: Message['senderType']) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingStatus, setTypingStatus] = useState<TypingStatus | null>(null);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(0);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToMessages(sessionId, (msgs) => {
      const settings = loadSettings();
      if (msgs.length > prevCountRef.current && prevCountRef.current > 0) {
        const latest = msgs[msgs.length - 1];
        if (latest.senderId !== deviceId) {
          if (settings.soundEnabled) playSound('receive');
          if (settings.vibrationEnabled) vibrate([50, 30, 50]);
          setNewMessageIds(prev => new Set([...prev, latest.id]));
          setTimeout(() => {
            setNewMessageIds(prev => {
              const next = new Set(prev);
              next.delete(latest.id);
              return next;
            });
          }, 2000);
        }
      }
      prevCountRef.current = msgs.length;
      setMessages(msgs);
    });
    return unsub;
  }, [sessionId, deviceId]);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToTyping(sessionId, deviceId, setTypingStatus);
    return unsub;
  }, [sessionId, deviceId]);

  const sendMessage = useCallback(async (text: string): Promise<string | null> => {
    if (!sessionId || !text.trim()) return null;
    const settings = loadSettings();
    const id = await fsendMessage(sessionId, {
      text: text.trim(),
      senderId: deviceId,
      senderNickname: nickname,
      senderType,
      timestamp: Date.now(),
      read: false,
      sessionId,
    });
    if (settings.soundEnabled) playSound('send');
    if (settings.vibrationEnabled) vibrate(30);
    return id;
  }, [sessionId, deviceId, nickname, senderType]);

  const handleTyping = useCallback(async (isTyping: boolean) => {
    if (!sessionId) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    await setTyping(sessionId, deviceId, nickname, isTyping);
    if (isTyping) {
      typingTimerRef.current = setTimeout(() => {
        setTyping(sessionId, deviceId, nickname, false);
      }, 3000);
    }
  }, [sessionId, deviceId, nickname]);

  const removeMessage = useCallback(async (messageId: string) => {
    if (!sessionId) return;
    await deleteMessage(sessionId, messageId);
  }, [sessionId]);

  const clearAll = useCallback(async () => {
    if (!sessionId) return;
    await clearMessages(sessionId);
  }, [sessionId]);

  return { messages, typingStatus, newMessageIds, sendMessage, handleTyping, removeMessage, clearAll };
};
