'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
  className?: string;
  index?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-navy-900',
  iconBg = 'bg-navy-50',
  description,
  className,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden bg-slate-900/40 border-slate-800/60 hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-300 shadow-none',
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400">{title}</p>
              <motion.p
                className="text-3xl font-bold text-white"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                {value}
              </motion.p>
              {change && (
                <p
                  className={cn(
                    'text-xs font-medium',
                    changeType === 'positive' && 'text-emerald-500',
                    changeType === 'negative' && 'text-rose-500',
                    changeType === 'neutral' && 'text-slate-500'
                  )}
                >
                  {change}
                </p>
              )}
              {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                iconBg
              )}
            >
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
