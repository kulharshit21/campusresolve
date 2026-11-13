import { ComplaintCategory, ComplaintStatus } from '@/types';

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  open: {
    label: 'Open / Pending',
    bg: 'bg-red-50 text-red-700 border-red-200',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  'Wi-Fi / Network': 'bg-blue-100 text-blue-800 border-blue-200',
  Electrical: 'bg-amber-100 text-amber-800 border-amber-200',
  Hostel: 'bg-purple-100 text-purple-800 border-purple-200',
  Classroom: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Cleanliness: 'bg-teal-100 text-teal-800 border-teal-200',
  'Water / Plumbing': 'bg-sky-100 text-sky-800 border-sky-200',
  Library: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Other: 'bg-slate-100 text-slate-800 border-slate-200',
};
