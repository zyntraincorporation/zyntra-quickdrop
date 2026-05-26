'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clipboard, X } from 'lucide-react';
import { pasteFromClipboard, cn } from '../lib/utils';

interface Props {
  onSend: (text: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export default function TextInput({ onSend, onTyping, disabled }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTyping(true);
    typingTimerRef.current = setTimeout(() => onTyping(false), 2000);

    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }
  };

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending || disabled) return;
    setSending(true);
    onTyping(false);
    try {
      await onSend(text);
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [text, sending, disabled, onSend, onTyping]);

  const handlePaste = async () => {
    const content = await pasteFromClipboard();
    if (content) {
      setText(prev => prev + content);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="relative">
      {/* Input container */}
      <motion.div
        className={cn(
          'flex items-end gap-2 bg-white/5 border rounded-2xl p-2 transition-all',
          hasText ? 'border-indigo-500/40' : 'border-white/10'
        )}
        animate={{ boxShadow: hasText ? '0 0 20px rgba(99,102,241,0.15)' : '0 0 0px transparent' }}
      >
        {/* Paste button */}
        <motion.button
          onClick={handlePaste}
          whileTap={{ scale: 0.88 }}
          disabled={disabled}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-all disabled:opacity-40"
          title="Paste from clipboard"
        >
          <Clipboard size={16} />
        </motion.button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste text to send…"
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm leading-relaxed resize-none outline-none py-1.5 min-h-[36px] max-h-[140px] overflow-y-auto scrollbar-none disabled:opacity-40"
        />

        {/* Clear button */}
        <AnimatePresence>
          {hasText && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setText('')}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Send button */}
        <motion.button
          onClick={handleSend}
          disabled={!hasText || sending || disabled}
          whileTap={hasText ? { scale: 0.88 } : undefined}
          className={cn(
            'shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all',
            hasText && !disabled
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-white/5 text-zinc-600'
          )}
        >
          <AnimatePresence mode="wait">
            {sending ? (
              <motion.div
                key="spinner"
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <motion.div key="send" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <Send size={15} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Hint */}
      <p className="text-[10px] text-zinc-700 mt-1.5 px-1">
        Ctrl+Enter to send · Paste button for clipboard
      </p>
    </div>
  );
}
