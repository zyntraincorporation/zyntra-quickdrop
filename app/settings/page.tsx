'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bell, Volume2, Moon, Sun, Trash2, Unlink,
  Smartphone, Monitor, Clipboard, Info, Check, Zap
} from 'lucide-react';
import { loadSettings, saveSettings, clearStoredSession, DEFAULT_SETTINGS } from '../../lib/utils';
import { clearMessages } from '../../lib/firestore';
import { getStoredSessionId } from '../../lib/utils';
import { AppSettings } from '../../types';
import toast, { Toaster } from 'react-hot-toast';

interface ToggleRowProps {
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow = ({ label, sublabel, icon, value, onChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between py-3.5 px-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {sublabel && <p className="text-xs text-zinc-600 mt-0.5">{sublabel}</p>}
      </div>
    </div>
    <motion.button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-white/10'}`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
        animate={{ left: value ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [nickname, setNickname] = useState(settings.deviceNickname || '');
  const [saved, setSaved] = useState(false);

  const updateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveNickname = () => {
    updateSettings({ deviceNickname: nickname });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearHistory = async () => {
    const sessionId = getStoredSessionId();
    if (!sessionId) return;
    if (!confirm('Clear all messages? This cannot be undone.')) return;
    await clearMessages(sessionId);
    toast.success('History cleared', { position: 'bottom-center' });
  };

  const handleUnpair = () => {
    if (!confirm('Unpair this device? You will need to scan a QR code again.')) return;
    clearStoredSession();
    router.replace('/');
  };

  const sectionClass = 'bg-white/4 border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/6 mb-4';

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-zinc-950/90 backdrop-blur-xl border-b border-white/6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Settings</span>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* Device Nickname */}
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-1">Device</p>
        <div className={sectionClass}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400">
                <Smartphone size={15} />
              </div>
              <p className="text-sm text-zinc-200">Device Nickname</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="My Phone / My Laptop…"
                maxLength={30}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/40 transition-colors"
              />
              <motion.button
                onClick={handleSaveNickname}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors"
              >
                {saved ? <Check size={15} className="text-emerald-400" /> : 'Save'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-1 mt-2">Notifications</p>
        <div className={sectionClass}>
          <ToggleRow
            label="Enable Notifications"
            sublabel="Toast popups for incoming messages"
            icon={<Bell size={15} />}
            value={settings.notificationsEnabled}
            onChange={v => updateSettings({ notificationsEnabled: v })}
          />
          <ToggleRow
            label="Sound Feedback"
            sublabel="Audio on send, receive, copy"
            icon={<Volume2 size={15} />}
            value={settings.soundEnabled}
            onChange={v => updateSettings({ soundEnabled: v })}
          />
        </div>

        {/* Behaviour */}
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-1 mt-2">Behaviour</p>
        <div className={sectionClass}>
          <ToggleRow
            label="Auto-Copy Incoming"
            sublabel="Automatically copy received text"
            icon={<Clipboard size={15} />}
            value={settings.autoCopy}
            onChange={v => updateSettings({ autoCopy: v })}
          />
        </div>

        {/* Appearance */}
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-1 mt-2">Appearance</p>
        <div className={sectionClass}>
          <div className="p-4">
            <p className="text-sm text-zinc-200 mb-3">Theme</p>
            <div className="flex gap-2">
              {(['dark', 'light', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`flex-1 py-2 rounded-xl text-xs capitalize transition-all ${
                    settings.theme === t
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-1 mt-2">Danger Zone</p>
        <div className={sectionClass}>
          <motion.button
            onClick={handleClearHistory}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
          >
            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Trash2 size={15} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-400">Clear All Messages</p>
              <p className="text-xs text-zinc-600">Permanently delete message history</p>
            </div>
          </motion.button>
          <motion.button
            onClick={handleUnpair}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
          >
            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Unlink size={15} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-400">Unpair This Device</p>
              <p className="text-xs text-zinc-600">Removes pairing — you can pair again anytime</p>
            </div>
          </motion.button>
        </div>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-[11px] text-zinc-700">Zyntra QuickDrop · v1.0.0</p>
          <p className="text-[10px] text-zinc-800 mt-0.5">Built by Zyntra Verse</p>
        </div>
      </div>
    </div>
  );
}
