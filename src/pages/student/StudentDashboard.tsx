import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Complaint, ComplaintStats } from '@/types';
import {
  fetchComplaints,
  fetchComplaintStats,
  subscribeToComplaintsRealtime,
} from '@/services/complaintService';
import { StatCard } from '@/components/dashboard/StatCard';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
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

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    const [complaintsRes, statsData] = await Promise.all([
      fetchComplaints({ studentId: user.id }),
      fetchComplaintStats(user.id),
    ]);
    setComplaints(complaintsRes.data);
    setStats(statsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime updates for student complaints
    const unsubscribe = subscribeToComplaintsRealtime((payload) => {
      console.log('Realtime update received on student dashboard:', payload);
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Student Complaint Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Track your ongoing campus maintenance requests in real-time or log a new classroom,
            hostel, or network problem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/student/new-complaint">
              <Button
                variant="primary"
                className="bg-white text-blue-800 hover:bg-blue-50 font-semibold shadow-md"
                leftIcon={<PlusCircle className="w-4 h-4 text-blue-700" />}
              >
                Log New Complaint
              </Button>
            </Link>
            <Link to="/student/complaints">
              <Button
                variant="outline"
                className="bg-blue-800/60 border-blue-400 text-white hover:bg-blue-800"
                leftIcon={<ClipboardList className="w-4 h-4" />}
              >
                View All My Complaints
              </Button>
            </Link>
          </div>
        </div>
        {/* Background decorative accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submitted"
          value={stats.total}
          subtitle="Your lifetime complaints"
          icon={<Layers className="w-6 h-6" />}
          variant="slate"
        />
        <StatCard
          title="Open / Pending"
          value={stats.open}
          subtitle="Awaiting admin review"
          icon={<AlertCircle className="w-6 h-6" />}
          variant="purple"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Technician assigned"
          icon={<Clock className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Successfully fixed"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Live updates automatically update when administrators change ticket status
            </p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No complaints reported yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Have you noticed any maintenance, Wi-Fi, or equipment issues on campus?
            </p>
            <Link to="/student/new-complaint">
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Submit Your First Complaint
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.slice(0, 6).map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                linkPrefix="/student/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
