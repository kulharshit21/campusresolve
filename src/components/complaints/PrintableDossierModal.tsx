import React from 'react';
import { Complaint, ComplaintStatusHistory } from '@/types';
import { formatDate, getDepartment, getPriority, getSlaInfo } from '@/lib/utils';
import { UNIVERSITY_INFO } from '@/lib/constants';
import { Printer, X, ShieldAlert, CheckCircle2, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrintableDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  history: ComplaintStatusHistory[];
}

export const PrintableDossierModal: React.FC<PrintableDossierModalProps> = ({
  isOpen,
  onClose,
  complaint,
  history,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const sla = getSlaInfo(complaint.created_at, complaint.category, complaint.status, complaint.resolved_at);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Official UGC Grievance Redressal Dossier Format</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Document Body */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-900 font-sans print:p-6" id="printable-dossier-content">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-blue-700 shrink-0" />
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                  {UNIVERSITY_INFO.name}
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Central Campus Grievance Redressal & Infrastructure Maintenance Cell
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {UNIVERSITY_INFO.compliance} • Portal Ref: {UNIVERSITY_INFO.portalName}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 font-mono font-bold text-xs rounded">
                CASE: {complaint.tracking_code}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Generated: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Grievance Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Complainant</span>
              <span className="font-bold text-slate-900">{complaint.student_profile?.full_name || 'Student'}</span>
              <span className="text-[10px] text-slate-500 block truncate">{complaint.student_profile?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Department Unit</span>
              <span className="font-bold text-slate-900">{getDepartment(complaint.category)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
              <span className="font-bold uppercase text-blue-700">{complaint.status}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Target</span>
              <span className="font-bold text-slate-900">{sla.targetHours}h ({getPriority(complaint.category).toUpperCase()})</span>
            </div>
          </div>

          {/* Incident Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Incident Problem Statement
            </h3>
            <p className="text-sm font-bold text-slate-900">{complaint.title}</p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location: <strong>{complaint.campus_location}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Logged: <strong>{formatDate(complaint.created_at)}</strong>
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line mt-2">
              {complaint.description}
            </div>
          </div>

          {/* Photographic Evidence if attached */}
          {complaint.image_url && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                Field Evidence Capture
              </h3>
              <div className="p-2 rounded-lg border border-slate-200 bg-slate-50 inline-block">
                <img
                  src={complaint.image_url}
                  alt="Field Evidence"
                  className="max-h-48 rounded object-contain border border-slate-200"
                />
              </div>
            </div>
          )}

          {/* Audit Trail Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Timestamped Audit Trail & Status History
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Action / State</th>
                    <th className="p-2">Official Authorized</th>
                    <th className="p-2">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-slate-400">
                        Initial incident record active.
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id}>
                        <td className="p-2 font-mono text-[11px] whitespace-nowrap">{formatDate(h.changed_at)}</td>
                        <td className="p-2 font-bold uppercase text-blue-700">{h.new_status}</td>
                        <td className="p-2">{h.changer_profile?.full_name || 'System / Officer'}</td>
                        <td className="p-2 text-slate-600">{h.note || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resolution Note if resolved */}
          {complaint.status === 'resolved' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Verified Resolution Certification
              </div>
              <p className="text-emerald-950 pl-5 leading-relaxed">
                {complaint.resolution_note || 'Issue remediated and verified clear by technical dispatch.'}
              </p>
              {complaint.resolved_at && (
                <p className="text-[11px] text-emerald-800 pl-5">
                  Resolution Timestamp: {formatDate(complaint.resolved_at)} ({sla.remainingText})
                </p>
              )}
            </div>
          )}

          {/* Official Sign-off Signature Blocks */}
          <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="h-14 border-b border-dashed border-slate-400 flex items-end pb-1 font-serif italic text-slate-600">
                Harshit Kulkarni (Chief Admin)
              </div>
              <span className="font-bold text-slate-900 block mt-1">Authorized Facilities Admin</span>
              <span className="text-[11px] text-slate-500">Apex Institute Grievance Desk</span>
            </div>

            <div>
              <div className="h-14 border-b border-dashed border-slate-400 flex items-end pb-1 text-slate-400 italic">
                Verified Stamp & Seal
              </div>
              <span className="font-bold text-slate-900 block mt-1">Institutional Review Committee</span>
              <span className="text-[11px] text-slate-500">UGC Compliance Verification Board</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
