'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Smartphone, Monitor, ArrowRight, Shield, Bolt } from 'lucide-react';
import { getStoredSessionId } from '../lib/utils';

const features = [
  { icon: Zap, title: 'Instant Sync', desc: 'Real-time text transfer between any devices with zero delay.' },
  { icon: Shield, title: 'Secure Pairing', desc: 'QR code device pairing with anonymous-first authentication.' },
  { icon: Bolt, title: 'One-Click Copy', desc: 'Floating toast notifications with instant copy buttons.' },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredSessionId();
    if (stored) router.replace('/dashboard');
  }, [router]);

  return (
    <main className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold text-white leading-none">Zyntra</p>
              <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase">QuickDrop</p>
            </div>
          </div>

          {/* Hero text */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: 'system-ui' }}
          >
            Drop text between
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              any device, instantly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-400 text-sm leading-relaxed"
          >
            Pair your phone and laptop in seconds with a QR code.
            <br />
            Real-time text sync. No login required.
          </motion.p>
        </motion.div>

        {/* Device illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-28 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative">
              <Smartphone size={26} className="text-zinc-400" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <span className="text-[10px] text-zinc-600">Mobile</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative">
              <Monitor size={22} className="text-zinc-400" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span className="text-[10px] text-zinc-600">Desktop</span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-10 w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-white/4 border border-white/8 rounded-2xl p-3 text-center backdrop-blur-sm"
            >
              <f.icon size={18} className="text-indigo-400 mx-auto mb-2" />
              <p className="text-[11px] font-semibold text-white mb-1">{f.title}</p>
              <p className="text-[10px] text-zinc-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <motion.button
            onClick={() => router.push('/pair')}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
          >
            Get Started Free
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-5 text-[11px] text-zinc-600"
        >
          No account needed · Works offline · Open source
        </motion.p>
      </div>
    </main>
  );
}
