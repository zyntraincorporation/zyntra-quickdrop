'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, QrCode, Copy, Search, X, Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import MessageBubble from '../../components/MessageBubble';
import TextInput from '../../components/TextInput';
import TypingIndicator from '../../components/TypingIndicator';
import StatusIndicator from '../../components/StatusIndicator';
import InstallButton from '../../components/InstallButton';
import { showIncomingToast } from '../../components/Toast';

import { useDevice } from '../../hooks/useDevice';
import { useMessages } from '../../hooks/useMessages';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { subscribeToDevices, upsertDevice } from '../../lib/firestore';
import { copyToClipboard, DEFAULT_SETTINGS, getStoredSessionId, loadSettings, playSound } from '../../lib/utils';
import { Device } from '../../types';

export default function DashboardPage() {
  const router = useRouter();
  const { deviceId, device, ready, registerDevice } = useDevice();
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [pairedDevices, setPairedDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Restore or create session
  useEffect(() => {
    if (!ready || !deviceId) return;
    let cancelled = false;

    const init = async () => {
      const stored = getStoredSessionId();
      if (stored) {
        if (cancelled) return;
        setActiveSessionId(stored);
        if (device) await registerDevice(stored);
        if (cancelled) return;
        setSessionReady(true);
      } else {
        router.replace('/pair');
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [ready, deviceId, device, registerDevice, router]);

  const { messages, typingStatus, newMessageIds, sendMessage, handleTyping, removeMessage } = useMessages(
    activeSessionId,
    deviceId,
    device?.nickname || 'Unknown',
    device?.type || 'unknown'
  );

  const isOnline = useOnlineStatus(deviceId, activeSessionId);

  // Subscribe to paired devices
  useEffect(() => {
    if (!activeSessionId) return;
    const unsub = subscribeToDevices(activeSessionId, setPairedDevices);
    return unsub;
  }, [activeSessionId]);

  // Show toast for incoming messages
  useEffect(() => {
    if (messages.length === 0) return;
    if (messages.length <= prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length;
      return;
    }
    const latest = messages[messages.length - 1];
    if (latest.senderId !== deviceId && messages.length > prevMessageCountRef.current) {
      showIncomingToast(latest, () => {
        copyToClipboard(latest.text);
        if (settings.soundEnabled) playSound('copy');
      });
      if (settings.autoCopy) copyToClipboard(latest.text);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, deviceId, settings.autoCopy, settings.soundEnabled]);

  useEffect(() => {
    if (!activeSessionId || !deviceId || !settings.notificationsEnabled) return;

    let cancelled = false;

    const syncNotificationToken = async () => {
      try {
        const { getFCMToken, requestNotificationPermission } = await import('../../lib/notifications');
        const granted = await requestNotificationPermission();
        if (!granted || cancelled) return;

        const fcmToken = await getFCMToken();
        if (!fcmToken || cancelled) return;

        await upsertDevice({ id: deviceId, sessionId: activeSessionId, fcmToken });
      } catch {
        // Push notifications are optional; realtime Firestore sync still works without them.
      }
    };

    void syncNotificationToken();

    return () => {
      cancelled = true;
    };
  }, [activeSessionId, deviceId, settings.notificationsEnabled]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatus]);

  const filteredMessages = searchQuery
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  const handleCopyLatest = async () => {
    const myMessages = messages.filter(m => m.senderId === deviceId);
    if (!myMessages.length) return;
    const latest = myMessages[myMessages.length - 1];
    await copyToClipboard(latest.text);
    if (settings.soundEnabled) playSound('copy');
    toast.success('Copied!', { duration: 1500, position: 'bottom-center' });
  };

  if (!ready || !sessionReady) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <Loader size={20} className="text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col overflow-hidden">
      {/* Toast container */}
      <Toaster
        position="top-right"
        toastOptions={{ className: '!bg-transparent !shadow-none !p-0' }}
      />

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/6 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">QuickDrop</p>
            <p className="text-[10px] text-zinc-600 leading-none mt-0.5">{device?.nickname || 'My Device'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InstallButton />
          <StatusIndicator devices={pairedDevices} myDeviceId={deviceId} isOnline={isOnline} />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSearch(s => !s)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            {showSearch ? <X size={15} /> : <Search size={15} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <Settings size={15} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/pair')}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <QrCode size={15} />
          </motion.button>
        </div>
      </header>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden border-b border-white/6"
          >
            <div className="px-4 py-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 relative">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/4 rounded-full blur-[80px]" />
        </div>

        <AnimatePresence initial={false}>
          {filteredMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-16 h-16 bg-white/4 rounded-3xl flex items-center justify-center border border-white/8">
                <Zap size={28} className="text-indigo-400/60" />
              </div>
              <div className="text-center">
                <p className="text-zinc-400 text-sm font-medium">No messages yet</p>
                <p className="text-zinc-700 text-xs mt-1">Send something to get started.</p>
              </div>
              {pairedDevices.filter(d => d.id !== deviceId).length === 0 && (
                <motion.button
                  onClick={() => router.push('/pair')}
                  whileTap={{ scale: 0.97 }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-500/15 border border-indigo-500/25 rounded-xl text-indigo-300 text-sm"
                >
                  <QrCode size={14} />
                  Pair a device first
                </motion.button>
              )}
            </motion.div>
          ) : (
            filteredMessages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={message.senderId === deviceId}
                isNew={newMessageIds.has(message.id)}
                onDelete={removeMessage}
                soundEnabled={settings.soundEnabled}
                vibrationEnabled={settings.vibrationEnabled}
              />
            ))
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingStatus && (
            <TypingIndicator status={typingStatus} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="shrink-0 px-4 pt-2 flex gap-2">
        <motion.button
          onClick={handleCopyLatest}
          whileTap={{ scale: 0.94 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-xl text-zinc-400 hover:text-indigo-300 text-xs transition-all"
        >
          <Copy size={13} />
          Copy Last Sent
        </motion.button>
        <motion.button
          onClick={() => router.push('/settings')}
          whileTap={{ scale: 0.94 }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-xl text-zinc-400 hover:text-indigo-300 text-xs transition-all"
        >
          <Settings size={13} />
        </motion.button>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <TextInput
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={!activeSessionId}
        />
      </div>
    </div>
  );
}
