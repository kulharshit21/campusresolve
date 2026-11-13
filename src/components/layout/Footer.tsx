import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-800">CampusResolve</span>
          <span className="text-xs text-slate-400">| University Issue Management Platform</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Built with React, TypeScript & Supabase
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Final Review Edition — Nov 2026</span>
        </div>

        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CampusResolve. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
