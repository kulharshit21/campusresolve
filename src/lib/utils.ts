import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Complaint, ComplaintCategory } from '@/types';
import { CATEGORY_SLA_HOURS, CATEGORY_PRIORITY, CATEGORY_DEPARTMENT } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

// Calculate Service Level Agreement (SLA) status
export function getSlaInfo(
  createdAt: string,
  category: ComplaintCategory,
  status: string,
  resolvedAt?: string | null
): {
  targetHours: number;
  isOverdue: boolean;
  remainingText: string;
  badgeColor: string;
} {
  const targetHours = CATEGORY_SLA_HOURS[category] || 24;
  const created = new Date(createdAt).getTime();
  const deadline = created + targetHours * 3600 * 1000;
  const compareTime = status === 'resolved' && resolvedAt ? new Date(resolvedAt).getTime() : Date.now();

  const diffMs = deadline - compareTime;
  const diffHours = Math.round(diffMs / (3600 * 1000));

  if (status === 'resolved') {
    if (diffMs >= 0) {
      return {
        targetHours,
        isOverdue: false,
        remainingText: `Met SLA (${targetHours}h target)`,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      };
    } else {
      return {
        targetHours,
        isOverdue: true,
        remainingText: `Exceeded SLA by ${Math.abs(diffHours)}h`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }
  }

  // Active / Open ticket
  if (diffMs < 0) {
    return {
      targetHours,
      isOverdue: true,
      remainingText: `Overdue by ${Math.abs(diffHours)}h`,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
    };
  }

  if (diffHours <= 4) {
    return {
      targetHours,
      isOverdue: false,
      remainingText: `${diffHours}h left (Due soon)`,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }

  return {
    targetHours,
    isOverdue: false,
    remainingText: `${diffHours}h remaining (${targetHours}h SLA)`,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  };
}

export function getDepartment(category: ComplaintCategory): string {
  return CATEGORY_DEPARTMENT[category] || 'General Administration';
}

export function getPriority(category: ComplaintCategory): 'critical' | 'high' | 'medium' | 'low' {
  return CATEGORY_PRIORITY[category] || 'medium';
}

// Export complaints list to CSV file
export function exportComplaintsToCSV(complaints: Complaint[], filename = 'campusresolve_complaints.csv') {
  const headers = [
    'Tracking Code',
    'Title',
    'Category',
    'Location',
    'Status',
    'Priority',
    'Department',
    'Reported By',
    'Student Email',
    'Created At',
    'Resolved At',
    'Resolution Note',
  ];

  const rows = complaints.map((c) => [
    `"${c.tracking_code}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${c.campus_location.replace(/"/g, '""')}"`,
    `"${c.status}"`,
    `"${getPriority(c.category).toUpperCase()}"`,
    `"${getDepartment(c.category)}"`,
    `"${(c.student_profile?.full_name || 'Anonymous').replace(/"/g, '""')}"`,
    `"${c.student_profile?.email || 'N/A'}"`,
    `"${formatDate(c.created_at)}"`,
    `"${c.resolved_at ? formatDate(c.resolved_at) : 'Pending'}"`,
    `"${(c.resolution_note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
