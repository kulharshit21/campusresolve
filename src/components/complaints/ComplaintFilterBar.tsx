import React from 'react';
import { COMPLAINT_CATEGORIES } from '@/types';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ComplaintFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  onReset?: () => void;
}

export const ComplaintFilterBar: React.FC<ComplaintFilterBarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  onReset,
}) => {
  const isFiltered = search !== '' || category !== 'all' || status !== 'all';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by title, tracking ID (e.g. CR-2026-1001), location..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 text-xs md:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="all">All Categories</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2 px-3 text-xs md:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open / Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="md:col-span-1 flex items-center justify-end">
          {isFiltered && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-slate-800 w-full"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
