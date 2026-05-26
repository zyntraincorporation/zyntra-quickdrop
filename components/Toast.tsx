'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Zap } from 'lucide-react';
import { Message } from '../types';
import { copyToClipboard, playSound, truncate } from '../lib/utils';
import toast from 'react-hot-toast';

interface IncomingToastProps {
  message: Message;
  onCopy: () => void;
  toastId: string;
}

export const IncomingToast = ({ message, onCopy, toastId }: IncomingToastProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.text);
    if (ok) {
      setCopied(true);
      playSound('copy');
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative w-80 bg-zinc-900/95 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/10 backdrop-blur-xl overflow-hidden"
    >
      {/* Glow accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">QuickDrop</p>
              <p className="text-[10px] text-zinc-500">{message.senderNickname}</p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-zinc-200 text-sm leading-relaxed mb-3 font-light">
          {truncate(message.text, 120)}
        </p>

        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-sm hover:bg-indigo-500/25 transition-all"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-emerald-400">
                <Check size={14} /> Copied!
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                <Copy size={14} /> Copy Text
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/60"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  );
};

export const showIncomingToast = (message: Message, onCopy?: () => void) => {
  toast.custom(
    (t) => (
      <AnimatePresence>
        {t.visible && (
          <IncomingToast
            message={message}
            toastId={t.id}
            onCopy={onCopy || (() => {})}
          />
        )}
      </AnimatePresence>
    ),
    { duration: 5000, position: 'top-right' }
  );
};
