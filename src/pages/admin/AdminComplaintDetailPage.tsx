import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Complaint, ComplaintComment, ComplaintStatus, ComplaintStatusHistory } from '@/types';
import {
  fetchComplaintById,
  fetchComments,
  fetchStatusHistory,
  updateComplaintStatus,
} from '@/services/complaintService';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { StatusTimeline } from '@/components/complaints/StatusTimeline';
import { CommentThread } from '@/components/complaints/CommentThread';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Maximize2,
  ShieldAlert,
} from 'lucide-react';

export const AdminComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [history, setHistory] = useState<ComplaintStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Image preview modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const loadDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    const [cRes, comRes, histRes] = await Promise.all([
      fetchComplaintById(id),
      fetchComments(id),
      fetchStatusHistory(id),
    ]);

    if (cRes.error || !cRes.data) {
      setError(cRes.error || 'Complaint not found.');
    } else {
      setComplaint(cRes.data);
      setComments(comRes.data);
      setHistory(histRes.data);
      setTargetStatus(cRes.data.status === 'open' ? 'in_progress' : 'resolved');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !user) return;

    if (targetStatus === 'resolved' && !resolutionNote.trim()) {
      setUpdateError('Resolution note is required when resolving a complaint.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    const { success, error: saveError } = await updateComplaintStatus({
      complaintId: complaint.id,
      newStatus: targetStatus,
      resolutionNote: resolutionNote.trim(),
      changedBy: user.id,
      changerName: user.full_name,
      changerRole: 'admin',
    });

    setIsUpdating(false);

    if (!success) {
      setUpdateError(saveError || 'Failed to update status.');
      return;
    }

    setIsStatusModalOpen(false);
    loadDetails();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'The requested ticket does not exist.'}</p>
        <Link to="/admin/dashboard" className="text-xs text-blue-600 font-semibold hover:underline">
          &larr; Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Navigation and Action Buttons */}
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Registry
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-sm font-bold bg-slate-900 text-white px-3 py-1 rounded-md shadow-sm">
                {complaint.tracking_code}
              </span>
              <CategoryBadge category={complaint.category} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={complaint.status} className="text-sm px-3.5 py-1.5" />
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsStatusModalOpen(true)}
              leftIcon={<ShieldAlert className="w-4 h-4" />}
            >
              Update Ticket Status
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Description, Resolution Notes, Timeline & Discussion */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Problem Report Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>

              {complaint.status === 'resolved' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Recorded Resolution Note
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed pl-6">
                    {complaint.resolution_note || 'Completed by facilities staff.'}
                  </p>
                  {complaint.resolved_at && (
                    <p className="text-[11px] text-emerald-700 pl-6">
                      Resolved on: {formatDate(complaint.resolved_at)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Status Lifecycle & Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline currentStatus={complaint.status} history={history} />
            </CardContent>
          </Card>

          {/* Comment Thread */}
          <Card>
            <CardContent className="pt-6">
              <CommentThread
                complaintId={complaint.id}
                initialComments={comments}
                onCommentAdded={loadDetails}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Student Details, Location & Evidence */}
        <div className="space-y-6">
          {/* Student Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Reporting Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                  {complaint.student_profile?.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">
                    {complaint.student_profile?.full_name || 'Registered Student'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {complaint.student_profile?.email || 'Student Account'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Reported Location</span>
                  <span>{complaint.campus_location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Submission Date</span>
                  <span>{formatDate(complaint.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photographic Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Student Photo Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.image_url ? (
                <div className="space-y-2">
                  <div
                    onClick={() => setIsImageModalOpen(true)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm"
                  >
                    <img
                      src={complaint.image_url}
                      alt="Complaint Evidence"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                      <Maximize2 className="w-4 h-4" />
                      Enlarge Evidence
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Click to review high-resolution image
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No image attached to this ticket.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Change Ticket Status — ${complaint.tracking_code}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Select New Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="open">Open / Pending Review</option>
              <option value="in_progress">In Progress (Maintenance In-Field)</option>
              <option value="resolved">Resolved (Completed & Verified)</option>
            </select>
          </div>

          <Textarea
            label={
              targetStatus === 'resolved'
                ? 'Official Resolution Note (Mandatory)'
                : 'Status Change Note (Optional)'
            }
            placeholder={
              targetStatus === 'resolved'
                ? 'Specify the corrective action taken, parts replaced, or inspection result...'
                : 'Provide optional context on technician dispatch or scheduling...'
            }
            required={targetStatus === 'resolved'}
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            error={updateError || undefined}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdating}>
              Confirm Status Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enlarged Image Evidence Modal */}
      {complaint.image_url && (
        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title={`Evidence for ${complaint.tracking_code}`}
          maxWidth="2xl"
        >
          <div className="space-y-3">
            <img
              src={complaint.image_url}
              alt="Enlarged evidence"
              className="w-full max-h-[70vh] object-contain rounded-lg border border-slate-200 mx-auto"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
