import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Complaint } from '@/types';
import { fetchComplaints } from '@/services/complaintService';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { ComplaintFilterBar } from '@/components/complaints/ComplaintFilterBar';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PlusCircle, ClipboardList } from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const loadComplaints = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await fetchComplaints({
      studentId: user.id,
      category,
      status,
      search,
    });
    setComplaints(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadComplaints();
  }, [user, category, status, search]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and monitor all maintenance tickets registered under your student account.
          </p>
        </div>
        <Link to="/student/new-complaint">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            New Complaint
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <ComplaintFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        onReset={handleResetFilters}
      />

      {/* Complaints Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No complaints matched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {search || category !== 'all' || status !== 'all'
              ? 'Try resetting your search query or filters.'
              : 'You have not submitted any complaints yet.'}
          </p>
          {search || category !== 'all' || status !== 'all' ? (
            <Button size="sm" variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          ) : (
            <Link to="/student/new-complaint">
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Submit Complaint
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 px-1">
            Showing {complaints.length} complaint{complaints.length > 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} linkPrefix="/student/complaints" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
