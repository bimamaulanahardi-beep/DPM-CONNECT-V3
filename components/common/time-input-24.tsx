'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface TimeInput24Props {
  value: string; // "HH:mm" e.g. "09:00" or "14:30"
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export function TimeInput24({
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  id,
}: TimeInput24Props) {
  const [hour = '', minute = ''] = (value || '').split(':');

  const handleHourChange = (newHour: string) => {
    if (!newHour) {
      onChange('');
      return;
    }
    const currentMin = minute || '00';
    onChange(`${newHour}:${currentMin}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const currentHour = hour || '09';
    onChange(`${currentHour}:${newMinute || '00'}`);
  };

  return (
    <div
      className={`group flex items-center bg-slate-950/70 border border-slate-800 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/30 rounded-xl px-3 h-10 w-full transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-400 shrink-0 mr-2 transition-colors" />

      {/* Jam Selector (00 - 23) */}
      <select
        id={id ? `${id}-hour` : undefined}
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="bg-transparent text-white text-xs font-mono font-semibold focus:outline-none cursor-pointer text-center appearance-none px-1"
        style={{ colorScheme: 'dark' }}
      >
        <option value="" disabled={required} className="bg-slate-900 text-slate-400">
          --
        </option>
        {HOURS.map((h) => (
          <option key={h} value={h} className="bg-slate-900 text-white font-mono">
            {h}
          </option>
        ))}
      </select>

      <span className="text-slate-500 font-bold text-xs mx-1">:</span>

      {/* Menit Selector (00 - 59) */}
      <select
        id={id ? `${id}-minute` : undefined}
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        required={required && !!hour}
        disabled={disabled}
        className="bg-transparent text-white text-xs font-mono font-semibold focus:outline-none cursor-pointer text-center appearance-none px-1"
        style={{ colorScheme: 'dark' }}
      >
        <option value="" disabled={required} className="bg-slate-900 text-slate-400">
          --
        </option>
        {MINUTES.map((m) => (
          <option key={m} value={m} className="bg-slate-900 text-white font-mono">
            {m}
          </option>
        ))}
      </select>

      <div className="ml-auto pl-2 flex items-center">
        <span className="text-[10px] font-bold text-amber-400/90 tracking-wider">
          WIB
        </span>
      </div>
    </div>
  );
}
