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
    if (!newMinute) {
      if (!hour) {
        onChange('');
        return;
      }
    }
    const currentHour = hour || '08';
    onChange(`${currentHour}:${newMinute || '00'}`);
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Jam Selector (00 - 23) */}
      <div className="relative flex-1 min-w-[70px]">
        <select
          id={id ? `${id}-hour` : undefined}
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          required={required}
          disabled={disabled}
          className="w-full bg-slate-950/70 border border-slate-800 text-white rounded-lg px-2.5 py-2 text-xs font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors appearance-none cursor-pointer text-center"
        >
          <option value="" disabled={required} className="bg-slate-900 text-slate-400">
            Jam
          </option>
          {HOURS.map((h) => (
            <option key={h} value={h} className="bg-slate-900 text-white font-mono">
              {h} ({parseInt(h, 10) < 11 ? 'Pagi' : parseInt(h, 10) < 15 ? 'Siang' : parseInt(h, 10) < 18 ? 'Sore' : 'Malam'})
            </option>
          ))}
        </select>
      </div>

      <span className="text-slate-400 font-bold text-sm">:</span>

      {/* Menit Selector (00 - 59) */}
      <div className="relative flex-1 min-w-[70px]">
        <select
          id={id ? `${id}-minute` : undefined}
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          required={required && !!hour}
          disabled={disabled}
          className="w-full bg-slate-950/70 border border-slate-800 text-white rounded-lg px-2.5 py-2 text-xs font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors appearance-none cursor-pointer text-center"
        >
          <option value="" disabled={required} className="bg-slate-900 text-slate-400">
            Menit
          </option>
          {MINUTES.map((m) => (
            <option key={m} value={m} className="bg-slate-900 text-white font-mono">
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* WIB Badge */}
      <span className="text-[11px] font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 rounded-lg select-none whitespace-nowrap">
        WIB
      </span>
    </div>
  );
}
