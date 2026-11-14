import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Complaint, ComplaintStats, ComplaintStatus } from '@/types';
import {
  fetchComplaints,
  fetchComplaintStats,
  updateComplaintStatus,
  subscribeToComplaintsRealtime,
} from '@/services/complaintService';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { ComplaintFilterBar } from '@/components/complaints/ComplaintFilterBar';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { exportComplaintsToCSV, getSlaInfo } from '@/lib/utils';
import { RESOLUTION_TEMPLATES } from '@/lib/constants';
import {
  ShieldAlert,
  Layers,
  AlertCircle,
  Clock,
  CheckCircle2,
  Eye,
  Edit3,
  RefreshCw,
  Download,
  MapPin,
  User,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    categoryCounts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  // Quick Status Update Modal
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [cRes, sRes] = await Promise.all([
      fetchComplaints({ category, status, search }),
      fetchComplaintStats(),
    ]);
    setComplaints(cRes.data);
    setStats(sRes);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime changes
    const unsubscribe = subscribeToComplaintsRealtime((payload) => {
      console.log('Realtime event on Admin dashboard:', payload);
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [category, status, search]);

  const handleOpenStatusModal = (complaint: Complaint) => {
    setActiveComplaint(complaint);
    setTargetStatus(complaint.status === 'open' ? 'in_progress' : 'resolved');
    setResolutionNote(complaint.resolution_note || '');
    setUpdateError(null);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !user) return;

    if (targetStatus === 'resolved' && !resolutionNote.trim()) {
      setUpdateError('Please provide a resolution note detailing how the issue was fixed.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    const { success, error } = await updateComplaintStatus({
      complaintId: activeComplaint.id,
      newStatus: targetStatus,
      resolutionNote: resolutionNote.trim(),
      changedBy: user.id,
      changerName: user.full_name,
      changerRole: 'admin',
    });

    setIsUpdating(false);

    if (!success) {
      setUpdateError(error || 'Failed to update status.');
      return;
    }

    setActiveComplaint(null);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Campus Administration Portal
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <strong className="text-slate-800">{user?.full_name}</strong> ({user?.email})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportComplaintsToCSV(complaints)}
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-600" />}
            title="Download formatted CSV records"
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campus Tickets"
          value={stats.total}
          subtitle="All campus complaints"
          icon={<Layers className="w-6 h-6" />}
          variant="slate"
        />
        <StatCard
          title="Open / Needs Action"
          value={stats.open}
          subtitle="Awaiting technician review"
          icon={<AlertCircle className="w-6 h-6" />}
          variant="purple"
        />
        <StatCard
          title="Under Maintenance"
          value={stats.inProgress}
          subtitle="In active resolution"
          icon={<Clock className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Successfully closed"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
      </div>

      {/* Recharts Analytics Charts */}
      <AnalyticsCharts stats={stats} />

      {/* Complaints Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Campus Issues Registry ({complaints.length})
            </h2>
            <p className="text-xs text-slate-500">
              Select any issue to inspect photographic evidence, timeline history, or post official updates.
            </p>
          </div>

          {/* Quick Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'open', label: 'Open', count: stats.open },
              { id: 'in_progress', label: 'In Progress', count: stats.inProgress },
              { id: 'resolved', label: 'Resolved', count: stats.resolved },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setStatus(p.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  status === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label} ({p.count})
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <ComplaintFilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          onReset={() => {
            setSearch('');
            setCategory('all');
            setStatus('all');
          }}
        />

        {/* Desktop Data Table (Shown on md+ screens) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Tracking ID</th>
                  <th className="px-4 py-3.5">Complaint Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Campus Location</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">SLA Info</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      Loading complaints registry...
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      No complaints match the specified filters.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => {
                    const sla = getSlaInfo(c.created_at, c.category, c.status, c.resolved_at);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {c.tracking_code}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900 max-w-[200px] truncate">
                          <Link
                            to={`/admin/complaints/${c.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <CategoryBadge category={c.category} />
                        </td>
                        <td className="px-4 py-3.5 max-w-[150px] truncate text-slate-500">
                          {c.campus_location}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                          {c.student_profile?.full_name || 'Student'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sla.badgeColor}`}>
                            {sla.remainingText}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenStatusModal(c)}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Update
                          </Button>
                          <Link to={`/admin/complaints/${c.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile / Small Screen Card View (Shown on < md screens) */}
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
              No complaints match the specified filters.
            </div>
          ) : (
            complaints.map((c) => {
              const sla = getSlaInfo(c.created_at, c.category, c.status, c.resolved_at);

              return (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-900 px-2 py-0.5 rounded">
                      {c.tracking_code}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  <div>
                    <Link
                      to={`/admin/complaints/${c.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-1"
                    >
                      {c.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.campus_location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.student_profile?.full_name || 'Student'}</span>
                    </div>
                    <CategoryBadge category={c.category} />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full border ${sla.badgeColor}`}>
                      {sla.remainingText}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatusModal(c)}
                        className="text-xs text-blue-600 hover:text-blue-700 py-1 h-auto"
                      >
                        Update
                      </Button>
                      <Link to={`/admin/complaints/${c.id}`}>
                        <Button variant="outline" size="sm" className="text-xs py-1 h-auto">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Status Update Modal */}
      {activeComplaint && (
        <Modal
          isOpen={Boolean(activeComplaint)}
          onClose={() => setActiveComplaint(null)}
          title={`Update Status: ${activeComplaint.tracking_code}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>
                <strong>Title:</strong> {activeComplaint.title}
              </p>
              <p>
                <strong>Category:</strong> {activeComplaint.category}
              </p>
              <p>
                <strong>Current Status:</strong>{' '}
                <span className="font-bold uppercase text-blue-600">
                  {activeComplaint.status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                New Ticket Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="open">Open / Pending Review</option>
                <option value="in_progress">In Progress (Maintenance Team Dispatched)</option>
                <option value="resolved">Resolved (Completed & Verified)</option>
              </select>
            </div>

            {targetStatus === 'resolved' && (
              <div className="space-y-2">
                <Textarea
                  label="Official Resolution Note (Mandatory for resolution)"
                  placeholder="Explain the technical fix performed (e.g. replaced AP firmware, repaired leaking valve, replaced HDMI interface)..."
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  error={updateError || undefined}
                  helperText="This note is permanently recorded in the UGC Grievance audit trail."
                />

                {/* Quick Resolution Note Template Pills */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    1-Click Resolution Templates:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {RESOLUTION_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResolutionNote(tpl)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-left line-clamp-1"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {updateError && targetStatus !== 'resolved' && (
              <p className="text-xs text-rose-600 font-medium">{updateError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveComplaint(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Apply Status Change
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
