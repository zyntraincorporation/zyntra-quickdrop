'use client';
import { motion } from 'framer-motion';
import { Device } from '../types';
import { Monitor, Smartphone } from 'lucide-react';

interface Props {
  devices: Device[];
  myDeviceId: string;
  isOnline: boolean;
}

export default function StatusIndicator({ devices, myDeviceId, isOnline }: Props) {
  const others = devices.filter(d => d.id !== myDeviceId);
  const paired = others.length > 0;
  const otherOnline = others.some(d => d.online);

  return (
    <div className="flex items-center gap-2">
      {/* Network status */}
      <motion.div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="text-[10px] text-zinc-400">{isOnline ? 'Online' : 'Offline'}</span>
      </motion.div>

      {/* Paired device status */}
      {paired && others.map(d => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10"
        >
          {d.type === 'mobile' ? <Smartphone size={10} className="text-zinc-400" /> : <Monitor size={10} className="text-zinc-400" />}
          <span className="text-[10px] text-zinc-400">{d.nickname}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${d.online ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
        </motion.div>
      ))}

      {!paired && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-zinc-500">No device paired</span>
        </div>
      )}
    </div>
  );
}
