import React from 'react';
import { ComplaintStatus, ComplaintStatusHistory } from '@/types';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, CircleDot, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ComplaintStatus;
  history: ComplaintStatusHistory[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, history }) => {
  const steps: { key: ComplaintStatus; label: string; desc: string }[] = [
    { key: 'open', label: '1. Registered / Open', desc: 'Complaint logged in system' },
    { key: 'in_progress', label: '2. In Progress', desc: 'Assigned & under maintenance' },
    { key: 'resolved', label: '3. Resolved', desc: 'Work verified & completed' },
  ];

  const getStepIndex = (s: ComplaintStatus) => {
    switch (s) {
      case 'open':
        return 0;
      case 'in_progress':
        return 1;
      case 'resolved':
        return 2;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isDone
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isCurrent
                    ? currentStatus === 'resolved'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                      : 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <CircleDot className="w-5 h-5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold ${
                  isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-400 max-w-[100px] text-center">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit History Log */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Audit & Status Activity Log ({history.length})
        </h4>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No historical status records logged yet.</p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((item) => (
              <div key={item.id} className="relative text-xs">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                <div className="flex flex-wrap items-center justify-between gap-1 text-slate-700">
                  <div className="font-semibold flex items-center gap-1.5">
                    {item.changer_profile?.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                        <UserCheck className="w-3 h-3" />
                        Student
                      </span>
                    )}
                    <span>{item.changer_profile?.full_name || 'System Operator'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(item.changed_at)}</span>
                </div>
                <div className="mt-1 text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <div className="font-medium text-slate-800">
                    Status set to:{' '}
                    <span className="font-bold uppercase text-blue-600">{item.new_status}</span>
                  </div>
                  {item.note && <div className="mt-0.5 text-slate-600">{item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
