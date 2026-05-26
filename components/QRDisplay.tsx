'use client';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '../lib/utils';

interface Props {
  code: string;
  sessionId: string;
}

export default function QRDisplay({ code, sessionId }: Props) {
  const [copied, setCopied] = useState(false);
  const pairUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pair?code=${code}`
    : '';

  const handleCopy = async () => {
    await copyToClipboard(pairUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      {/* QR Code */}
      <div className="relative p-4 bg-white rounded-2xl shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 -m-1" />
        <QRCodeSVG
          value={pairUrl || code}
          size={180}
          level="M"
          bgColor="transparent"
          fgColor="#1e1b4b"
          className="relative z-10"
        />
      </div>

      {/* Code display */}
      <div className="text-center">
        <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Pair Code</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {code.split('').map((char, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="w-9 h-11 flex items-center justify-center bg-white/8 border border-white/15 rounded-xl text-lg font-bold text-white font-mono tracking-wider"
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy link */}
      <motion.button
        onClick={handleCopy}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        {copied ? 'Link copied!' : 'Copy pair link'}
      </motion.button>
    </motion.div>
  );
}
