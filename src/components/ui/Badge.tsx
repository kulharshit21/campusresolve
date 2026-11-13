import React from 'react';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, CATEGORY_COLORS } from '@/lib/constants';
import { ComplaintCategory, ComplaintStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'danger' | 'warning' | 'success';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        config.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: ComplaintCategory;
  className?: string;
}) {
  const color = CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        color,
        className
      )}
    >
      {category}
    </span>
  );
}
