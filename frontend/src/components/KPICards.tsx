import React from 'react';
import { SystemStats } from '../types';
import { Database, ShieldCheck, AlertTriangle, Flame, Layers, Server, Clock, Flag } from 'lucide-react';

export interface KPICardsProps {
  stats: SystemStats | null;
  loading: boolean;
}

export const KPICards = ({ stats, loading }: KPICardsProps) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 my-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total Ingested', value: stats.total_reports, icon: Database, color: 'text-blue-400', bg: 'bg-blue-950/40' },
    { label: 'Reports Today', value: stats.reports_today, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-950/40' },
    { label: 'Verified Events', value: stats.verified_reports, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/40' },
    { label: 'Under Verification', value: stats.unverified_reports, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/40' },
    { label: 'High Severity Alert', value: stats.high_severity_events, icon: Flame, color: 'text-rose-400', bg: 'bg-rose-950/40' },
    { label: 'Flagged Reports', value: stats.flagged_reports, icon: Flag, color: 'text-orange-400', bg: 'bg-orange-950/40' },
    { label: 'Duplicate Records', value: stats.duplicate_reports, icon: Layers, color: 'text-purple-400', bg: 'bg-purple-950/40' },
    { label: 'Sources Online', value: stats.sources_online, icon: Server, color: 'text-cyan-400', bg: 'bg-cyan-950/40' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 my-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`border border-gray-800/80 rounded-xl p-3 flex flex-col justify-between ${item.bg} hover:border-gray-700 transition shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider line-clamp-1">
                {item.label}
              </span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-gray-100 font-mono tracking-tight">
                {item.value.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
