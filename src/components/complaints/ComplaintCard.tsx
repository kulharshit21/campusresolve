import React from 'react';
import { Link } from 'react-router-dom';
import { Complaint } from '@/types';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { MapPin, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  linkPrefix?: '/student/complaints' | '/admin/complaints';
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  linkPrefix = '/student/complaints',
}) => {
  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Header: Tracking Code & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {complaint.tracking_code}
            </span>
            <CategoryBadge category={complaint.category} />
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title */}
        <Link
          to={`${linkPrefix}/${complaint.id}`}
          className="block font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base mb-2 line-clamp-1"
        >
          {complaint.title}
        </Link>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div>
        {/* Location & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px]">{complaint.campus_location}</span>
          </div>

          <div className="flex items-center gap-3">
            {complaint.image_url && (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <ImageIcon className="w-3.5 h-3.5" />
                Evidence
              </span>
            )}
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRelativeTime(complaint.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Card action link */}
        <div className="mt-3 pt-2 flex items-center justify-end">
          <Link
            to={`${linkPrefix}/${complaint.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Details & Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
