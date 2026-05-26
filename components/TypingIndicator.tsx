'use client';
import { motion } from 'framer-motion';
import { TypingStatus } from '../types';

export default function TypingIndicator({ status }: { status: TypingStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 mb-3"
    >
      <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 backdrop-blur-sm">
        <span className="text-[11px] text-zinc-400 mr-1">{status.nickname}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
