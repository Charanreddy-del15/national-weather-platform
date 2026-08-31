import React from 'react';
import { WeatherEvent } from '../types/weather';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, ExternalLink, Eye, MapPin } from 'lucide-react';

interface EventTableProps {
  events: WeatherEvent[];
  onSelectEvent: (event: WeatherEvent) => void;
  onVerifyEvent: (eventId: string, status: string) => void;
}

export const EventTable: React.FC<EventTableProps> = ({ events, onSelectEvent, onVerifyEvent }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Verified</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 w-max"><ShieldCheck className="w-3 h-3"/> Under Review</span>;
      case 'FLAGGED':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Flagged</span>;
      case 'DUPLICATE':
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 w-max">Duplicate</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3"/> Unverified</span>;
    }
  };

  const getSeverityBadge = (severity: number) => {
    let color = 'bg-blue-500 text-white';
    if (severity >= 5) color = 'bg-rose-600 text-white font-bold animate-pulse';
    else if (severity >= 4) color = 'bg-orange-500 text-white font-bold';
    else if (severity >= 3) color = 'bg-amber-500 text-slate-900 font-bold';

    return <span className={`px-2 py-0.5 rounded text-xs ${color}`}>Sev {severity}/5</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200 text-sm">Real-Time Ingested Weather Event Feed</h3>
        <span className="text-xs text-slate-400">Showing {events.length} active events</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">Category & Severity</th>
              <th className="p-3">Location</th>
              <th className="p-3">Source Provenance</th>
              <th className="p-3">Raw Content Excerpt</th>
              <th className="p-3">Trust Score</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No weather events match the selected filters.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-slate-800/50 transition">
                  
                  {/* Category & Severity */}
                  <td className="p-3">
                    <div className="font-bold text-slate-100">{evt.event_category}</div>
                    <div className="mt-1">{getSeverityBadge(evt.severity)}</div>
                  </td>

                  {/* Location */}
                  <td className="p-3">
                    <div className="font-medium text-slate-200">{evt.city || evt.district}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{evt.state}</span>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="p-3">
                    <div className="font-medium text-slate-300">{evt.source_name || evt.source_type}</div>
                    <div className="text-[10px] text-slate-400">{evt.source_type}</div>
                  </td>

                  {/* Excerpt */}
                  <td className="p-3 max-w-xs">
                    <p className="line-clamp-2 text-slate-300">{evt.raw_text}</p>
                    {evt.hashtags && evt.hashtags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {evt.hashtags.map((h, i) => (
                          <span key={i} className="text-[10px] text-blue-400 font-mono">{h}</span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Trust Score */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.round(evt.trust_score * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-200">{Math.round(evt.trust_score * 100)}%</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3">{getStatusBadge(evt.verification_status)}</td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition"
                        title="View Detailed Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {evt.verification_status !== 'VERIFIED' && (
                        <button
                          onClick={() => onVerifyEvent(evt.event_id, 'VERIFIED')}
                          className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded text-[11px] font-semibold transition"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
