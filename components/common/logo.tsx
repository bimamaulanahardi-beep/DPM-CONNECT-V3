import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-12 h-12 rounded-2xl',
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden flex items-center justify-center shrink-0 shadow-lg bg-black border border-slate-800/40",
        sizeClasses[size],
        className
      )}
    >
      <img
        src="/logo.jpg"
        alt="Logo DPM ITB Riau"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
