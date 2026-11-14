import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Complaint, ComplaintComment, ComplaintStatusHistory } from '@/types';
import {
  fetchComplaintById,
  fetchComments,
  fetchStatusHistory,
  subscribeToComplaintsRealtime,
} from '@/services/complaintService';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusTimeline } from '@/components/complaints/StatusTimeline';
import { CommentThread } from '@/components/complaints/CommentThread';
import { Modal } from '@/components/ui/Modal';
import { formatDate, getDepartment, getSlaInfo } from '@/lib/utils';
import { PrintableDossierModal } from '@/components/complaints/PrintableDossierModal';
import {
  MapPin,
  Clock,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Maximize2,
  Printer,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [history, setHistory] = useState<ComplaintStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fullscreen image preview modal & printable dossier
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

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
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDetails();

    // Setup realtime subscription
    const unsubscribe = subscribeToComplaintsRealtime((payload) => {
      console.log('Realtime change received for complaint detail:', payload);
      if (payload.new && payload.new.id === id) {
        loadDetails();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

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
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'The requested ticket does not exist.'}</p>
        <Link to="/student/complaints" className="text-xs text-blue-600 font-semibold hover:underline">
          &larr; Return to Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Tracking Header */}
      <div>
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Complaints
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
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDossierOpen(true)}
              leftIcon={<Printer className="w-4 h-4 text-slate-600" />}
            >
              Print Grievance Receipt
            </Button>
            <StatusBadge status={complaint.status} className="text-sm px-3.5 py-1.5" />
          </div>
        </div>

        {/* SLA and Assigned Unit Strip */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Building className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Assigned Unit: <strong>{getDepartment(complaint.category)}</strong></span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Target SLA: <strong className="text-blue-900">{getSlaInfo(complaint.created_at, complaint.category, complaint.status, complaint.resolved_at).remainingText}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Details, Timeline, Resolution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Complaint Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Issue Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>

              {/* Resolution Note if resolved */}
              {complaint.status === 'resolved' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Official Administrator Resolution Note
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed pl-6">
                    {complaint.resolution_note || 'Resolved by campus facilities team.'}
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

          {/* Progress Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Resolution Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline currentStatus={complaint.status} history={history} />
            </CardContent>
          </Card>

          {/* Comment Thread Card */}
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

        {/* Right Column (1/3): Location, Metadata & Photographic Evidence */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Campus Location</span>
                  <span>{complaint.campus_location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Logged On</span>
                  <span>{formatDate(complaint.created_at)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Last Activity</span>
                  <span>{formatDate(complaint.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photographic Evidence Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Photographic Evidence
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
                      Click to Enlarge
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Original image uploaded by student during report submission
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No image evidence attached to this ticket.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
            <p className="text-xs text-slate-500 text-center">
              Campus Location: {complaint.campus_location}
            </p>
          </div>
        </Modal>
      )}
      {/* Printable Grievance Dossier / Receipt Modal */}
      <PrintableDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        complaint={complaint}
        history={history}
      />
    </div>
  );
};
