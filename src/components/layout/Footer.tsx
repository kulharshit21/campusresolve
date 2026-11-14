import React from 'react';
import { ShieldAlert, Phone, Mail, Building, FileCheck } from 'lucide-react';
import { UNIVERSITY_INFO } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 text-xs">
      {/* Top Banner with University Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight">{UNIVERSITY_INFO.portalName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Centralized digital incident reporting and infrastructure grievance resolution system for students, faculty, and residential scholars.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
              <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{UNIVERSITY_INFO.name}</span>
            </div>
          </div>

          {/* Col 2: Campus Service Divisions */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">Campus Facilities</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Optical Fiber & Wi-Fi Operations</li>
              <li>• Electrical Substations & Power Grid</li>
              <li>• Hostel Wardens & Residential Life</li>
              <li>• Central Civil Maintenance Cell</li>
              <li>• Classroom AV & Lab Equipment</li>
            </ul>
          </div>

          {/* Col 3: Emergency & Contact Contacts */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">Grievance Helpline</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{UNIVERSITY_INFO.helpline}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{UNIVERSITY_INFO.adminContact}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-400 pt-1">
                <FileCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px]">{UNIVERSITY_INFO.compliance}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Platform Architecture & Security */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">Technology & Architecture</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Powered by React 18, TypeScript, Tailwind CSS, Supabase PostgreSQL with Row Level Security (RLS), and Realtime WebSocket subscriptions.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700 font-mono">
                PostgreSQL RLS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700 font-mono">
                Vercel Edge
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700 font-mono">
                Realtime WebSockets
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} {UNIVERSITY_INFO.name}. All institutional rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>UGC Grievance Standard Ref: GRS-2026-APEX</span>
            <span>•</span>
            <span>Final University Review Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
