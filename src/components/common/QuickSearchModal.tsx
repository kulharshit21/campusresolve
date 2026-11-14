import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, ArrowRight, Shield, PlusCircle, LayoutDashboard } from 'lucide-react';
import { fetchComplaints } from '@/services/complaintService';
import { Complaint } from '@/types';
import { STATUS_CONFIG } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isStudent, isAdmin } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch complaints for search index
      fetchComplaints().then((res) => {
        setComplaints(res.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(complaints.slice(0, 5));
      return;
    }

    const q = query.toLowerCase();
    const matches = complaints.filter(
      (c) =>
        c.tracking_code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.campus_location.toLowerCase().includes(q)
    );
    setFiltered(matches.slice(0, 8));
    setSelectedIndex(0);
  }, [query, complaints]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelectComplaint(filtered[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  const handleSelectComplaint = (c: Complaint) => {
    onClose();
    if (isAdmin) {
      navigate(`/admin/complaints/${c.id}`);
    } else {
      navigate(`/student/complaints/${c.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-base"
            placeholder="Search tickets by tracking ID (CR-2026-...), category, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Body */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100">
          {/* Quick Actions Shortcuts */}
          {!query && (
            <div className="p-2 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                Quick Shortcuts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {isStudent && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/student/new-complaint');
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Report a New Issue</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard');
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>My Dashboard</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/admin/dashboard');
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Admin Review Center</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Complaints List */}
          <div className="p-1 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              {query ? `Matching Complaints (${filtered.length})` : 'Recent Complaints'}
            </p>

            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No campus issues matching "{query}". Try searching by department or tracking code.
              </div>
            ) : (
              filtered.map((item, idx) => {
                const statusInfo = STATUS_CONFIG[item.status];
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectComplaint(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900 ring-1 ring-blue-300'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.tracking_code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{item.category}</span>
                        </div>
                        <p className="text-sm font-semibold truncate text-slate-800 mt-0.5">{item.title}</p>
                        <p className="text-xs text-slate-500 truncate">{item.campus_location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}
                      >
                        {statusInfo.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↵</kbd> select
            </span>
          </div>
          <span>Apex University Central Portal</span>
        </div>
      </div>
    </div>
  );
};
