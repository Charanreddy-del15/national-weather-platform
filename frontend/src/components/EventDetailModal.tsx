import React from 'react';
import { WeatherEvent } from '../types/weather';
import { X, ShieldCheck, MapPin, Calendar, ExternalLink, Cpu, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface EventDetailModalProps {
  event: WeatherEvent | null;
  onClose: () => void;
  onVerify: (eventId: string, status: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onVerify }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100">{event.event_category}</span>
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-2 py-0.5 rounded font-semibold">
                Severity {event.severity}/5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Event ID: {event.event_id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Raw Text vs AI Extraction */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Original Raw Text Payload</div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{event.raw_text}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Geographic Location</span>
              <div className="font-semibold text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{event.city || event.district}, {event.state}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                GPS: {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)} (Conf: {Math.round(event.location_confidence * 100)}%)
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Source Provenance</span>
              <div className="font-semibold text-slate-200">{event.source_name || event.source_type}</div>
              <div className="text-[11px] text-slate-500 mt-1">Author: {event.author_name || 'System Ingestor'}</div>
            </div>
          </div>

          {/* AI & Verification Metrics */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> AI Classification Confidence
              </span>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(event.ai_confidence * 100)}%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Factor Trust Score
              </span>
              <span className="font-mono text-emerald-400 font-bold">{Math.round(event.trust_score * 100)}% ({event.verification_status})</span>
            </div>

            {event.is_duplicate && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Flagged as duplicate of parent event <strong>{event.parent_event_id}</strong> (Score: {event.duplicate_score})</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Moderation Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Recorded: {new Date(event.timestamp).toLocaleString()}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => { onVerify(event.event_id, 'REJECTED'); onClose(); }}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
            >
              Reject Report
            </button>
            <button
              onClick={() => { onVerify(event.event_id, 'VERIFIED'); onClose(); }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-emerald-600/20"
            >
              Mark as Verified
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
