'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Trash2, Monitor, Smartphone } from 'lucide-react';
import { Message } from '../types';
import { copyToClipboard, formatTime, playSound, vibrate, cn } from '../lib/utils';

interface Props {
  message: Message;
  isMine: boolean;
  isNew: boolean;
  onDelete: (id: string) => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export default function MessageBubble({ message, isMine, isNew, onDelete, soundEnabled, vibrationEnabled }: Props) {
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.text);
    if (ok) {
      setCopied(true);
      if (soundEnabled) playSound('copy');
      if (vibrationEnabled) vibrate(40);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const DeviceIcon = message.senderType === 'mobile' ? Smartphone : Monitor;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, y: -10 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={cn('flex w-full mb-3', isMine ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn('group max-w-[82%] relative', isMine ? 'items-end' : 'items-start')}
        onTouchStart={() => setShowDelete(true)}
        onTouchEnd={() => setTimeout(() => setShowDelete(false), 2500)}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        {/* New pulse ring */}
        {isNew && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ boxShadow: '0 0 0 4px rgba(99,102,241,0.5)' }}
          />
        )}

        <motion.div
          whileHover={{ scale: 1.01 }}
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm leading-relaxed break-words',
            isMine
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/25'
              : 'bg-white/8 border border-white/10 text-zinc-100 rounded-bl-sm backdrop-blur-sm'
          )}
        >
          {/* Sender info */}
          <div className={cn('flex items-center gap-1.5 mb-1.5 opacity-60', isMine ? 'justify-end' : 'justify-start')}>
            <DeviceIcon size={10} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{message.senderNickname}</span>
          </div>

          {/* Text */}
          <p className="text-[13px] leading-relaxed font-light">{message.text}</p>

          {/* Footer */}
          <div className={cn('flex items-center gap-2 mt-2', isMine ? 'justify-end' : 'justify-start')}>
            <span className="text-[10px] opacity-40">{formatTime(message.timestamp)}</span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <AnimatePresence>
          {showDelete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -5 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute -top-8 flex items-center gap-1 z-10',
                isMine ? 'right-0' : 'left-0'
              )}
            >
              <motion.button
                onClick={handleCopy}
                whileTap={{ scale: 0.85 }}
                className="flex items-center gap-1 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400">
                      <Check size={11} />
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Copy size={11} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>

              {isMine && (
                <motion.button
                  onClick={() => onDelete(message.id)}
                  whileTap={{ scale: 0.85 }}
                  className="flex items-center gap-1 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={11} />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
