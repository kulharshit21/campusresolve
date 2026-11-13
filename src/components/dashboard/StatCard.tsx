import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'amber' | 'emerald' | 'purple' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
  className,
}) => {
  const styles = {
    blue: {
      card: 'border-blue-100 bg-gradient-to-br from-white to-blue-50/50',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
      text: 'text-blue-900',
    },
    amber: {
      card: 'border-amber-100 bg-gradient-to-br from-white to-amber-50/50',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
      text: 'text-amber-900',
    },
    emerald: {
      card: 'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
      text: 'text-emerald-900',
    },
    purple: {
      card: 'border-purple-100 bg-gradient-to-br from-white to-purple-50/50',
      iconBg: 'bg-purple-600 text-white shadow-purple-500/20',
      text: 'text-purple-900',
    },
    slate: {
      card: 'border-slate-200 bg-white',
      iconBg: 'bg-slate-700 text-white shadow-slate-500/20',
      text: 'text-slate-900',
    },
  };

  const current = styles[variant];

  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between',
        current.card,
        className
      )}
    >
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h4 className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight mt-1', current.text)}>
          {value}
        </h4>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div
        className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center shadow-md shrink-0 ml-3',
          current.iconBg
        )}
      >
        {icon}
      </div>
    </div>
  );
};
