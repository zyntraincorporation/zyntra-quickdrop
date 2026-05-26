"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, QrCode, Keyboard, ArrowLeft, Loader } from 'lucide-react';
import QRDisplay from '../../components/QRDisplay';
import { useDevice } from '../../hooks/useDevice';
import { usePairing } from '../../hooks/usePairing';

type Mode = 'choose' | 'create' | 'join';

export default function PairPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('choose');
  const [joinCode, setJoinCode] = useState('');
  const [pairInfo, setPairInfo] = useState<{ sessionId: string; code: string } | null>(null);

  const { deviceId, ready } = useDevice();
  const { loading, error, createNewSession, joinExistingSession, setError } = usePairing();

  // Pre-fill code from URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setJoinCode(code.toUpperCase());
      setMode('join');
    }
  }, [searchParams]);

  const handleCreate = async () => {
    if (!deviceId) return;
    const result = await createNewSession(deviceId);
    setPairInfo(result);
    setMode('create');
  };

  const handleJoin = async () => {
    if (!deviceId || joinCode.length < 6) return;
    try {
      await joinExistingSession(joinCode, deviceId);
      router.push('/dashboard');
    } catch {}
  };

  const handleCodeInput = (val: string) => {
    setError('');
    setJoinCode(val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
  };

  if (!ready) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <Loader size={24} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => mode === 'choose' ? router.back() : setMode('choose')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Pair Device</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Choose mode */}
          {mode === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Connect Devices</h1>
                <p className="text-zinc-500 text-sm">Pair your phone and desktop to start sharing text instantly.</p>
              </div>

              <motion.button
                onClick={handleCreate}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-2xl text-left transition-all group"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-violet-500/30 transition-all">
                  <QrCode size={22} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Create Pair Code</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Generate QR code for another device to scan</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setMode('join')}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-2xl text-left transition-all group"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 transition-all">
                  <Keyboard size={22} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Enter Pair Code</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Type the 6-character code from another device</p>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Create / show QR */}
          {mode === 'create' && pairInfo && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">Scan to Pair</h2>
                <p className="text-zinc-500 text-sm">Scan this QR code on your other device, or share the pair link.</p>
              </div>

              <QRDisplay code={pairInfo.code} sessionId={pairInfo.sessionId} />

              <motion.div
                className="w-full bg-white/4 border border-white/8 rounded-2xl p-4 text-center"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Waiting for other device to connect…
                </div>
              </motion.div>

              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Continue without pairing →
              </button>
            </motion.div>
          )}

          {/* Join with code */}
          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Enter Pair Code</h2>
                <p className="text-zinc-500 text-sm">Type the 6-character code shown on the other device.</p>
              </div>

              <div>
                <div className="flex gap-2 justify-center mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 flex items-center justify-center rounded-xl border text-lg font-bold font-mono transition-all ${
                        joinCode[i]
                          ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                          : 'border-white/10 bg-white/4 text-zinc-700'
                      }`}
                    >
                      {joinCode[i] || '·'}
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={joinCode}
                  onChange={e => handleCodeInput(e.target.value)}
                  placeholder="Type code here…"
                  autoFocus
                  maxLength={6}
                  className="w-full bg-transparent border-0 text-transparent caret-indigo-400 outline-none text-center text-2xl tracking-[0.5em] font-mono absolute opacity-0 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => handleCodeInput(e.target.value)}
                  placeholder="XXXXXX"
                  autoFocus
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-white uppercase outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                onClick={handleJoin}
                disabled={joinCode.length < 6 || loading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin mx-auto" />
                ) : (
                  'Connect Device'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
