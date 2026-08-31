import React, { useState } from 'react';
import { WeatherEvent } from '../types';
import { X, ShieldCheck, ShieldAlert, AlertOctagon, MapPin, ExternalLink, Cpu, Layers, CheckCircle2, XCircle, Flag as FlagIcon } from 'lucide-react';
import { eventService, authService } from '../services/api';

interface EventDetailDrawerProps {
  eventId: string | null;
  onClose: () => void;
  onEventUpdated?: () => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ eventId, onClose, onEventUpdated }) => {
  const [data, setData] = React.useState<{ event: WeatherEvent; nearby_reports: WeatherEvent[] } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [updating, setUpdating] = useState(false);
  const currentUser = authService.getCurrentUser();

  React.useEffect(() => {
    if (!eventId) {
      setData(null);
      return;
    }
    setLoading(true);
    eventService
      .getEventById(eventId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [eventId]);

  if (!eventId) return null;

  const handleAdminStatusUpdate = async (newStatus: string) => {
    if (!data) return;
    setUpdating(true);
    try {
      await eventService.updateEvent(data.event.event_id, { verification_status: newStatus });
      const refreshed = await eventService.getEventById(data.event.event_id);
      setData(refreshed);
      if (onEventUpdated) onEventUpdated();
    } catch (e) {
      alert('Failed to update event status. Ensure you have admin credentials.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[560px] bg-gray-950 border-l border-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm text-gray-100 uppercase tracking-wider font-mono">
            Intelligence Record #{eventId}
          </span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {loading || !data ? (
        <div className="p-8 text-center text-gray-400 animate-pulse">Loading detailed intelligence record...</div>
      ) : (
        <div className="p-5 space-y-6">
          {/* Main Status & Category Badge */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">EVENT CATEGORY</span>
              <span className="bg-blue-900/60 text-blue-300 font-extrabold text-xs px-3 py-1 rounded-full border border-blue-700">
                {data.event.event_category.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Trust Score:</span>
                <span className="font-extrabold text-lg font-mono text-emerald-400">
                  {data.event.trust_score}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Status:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${
                    data.event.verification_status === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : data.event.verification_status === 'FLAGGED'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {data.event.verification_status}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Verification Action Bar */}
          {currentUser && ['SUPER_ADMIN', 'ADMIN', 'VERIFIER'].includes(currentUser.role) && (
            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-2">
                Control Room Actions
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={updating}
                  onClick={() => handleAdminStatusUpdate('VERIFIED')}
                  className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Verified</span>
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleAdminStatusUpdate('FLAGGED')}
                  className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded"
                >
                  <FlagIcon className="w-3.5 h-3.5" />
                  <span>Flag Report</span>
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleAdminStatusUpdate('REJECTED')}
                  className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

          {/* Raw Text vs AI Interpretation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Contents</h4>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Original Raw Input</span>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">{data.event.raw_text}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> AI Normalized NLP Output
                </span>
                <span className="text-[10px] font-mono text-gray-400">Confidence {Math.round(data.event.ai_confidence * 100)}%</span>
              </div>
              <p className="text-xs text-indigo-200/90 font-mono leading-relaxed">{data.event.normalized_text}</p>
            </div>
          </div>

          {/* Media Attachments */}
          {data.event.media_url && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Media Attachments</h4>
              <div className="rounded-xl overflow-hidden border border-gray-800 max-h-64">
                <img src={data.event.media_url} alt="Weather Event Media" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Location & Metadata */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Geolocation & Metadata</h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-2.5">
                <span className="text-[10px] text-gray-500 block">State & District</span>
                <span className="font-semibold text-gray-200">{data.event.state}, {data.event.district}</span>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-2.5">
                <span className="text-[10px] text-gray-500 block">City / Settlement</span>
                <span className="font-semibold text-gray-200">{data.event.city}</span>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-2.5">
                <span className="text-[10px] text-gray-500 block">GPS Coordinates</span>
                <span className="font-mono text-gray-300">{data.event.latitude.toFixed(4)}, {data.event.longitude.toFixed(4)}</span>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-2.5">
                <span className="text-[10px] text-gray-500 block">Source Provenance</span>
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  {data.event.author_name}
                  {data.event.source_url && (
                    <a href={data.event.source_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3 text-blue-400 hover:text-blue-200" />
                    </a>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Deduplication & Parent Linkage */}
          {data.event.is_duplicate && (
            <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-3.5">
              <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>Marked as Duplicate Record (Score: {Math.round(data.event.duplicate_score * 100)}%)</span>
              </div>
              <p className="text-[11px] text-purple-200/80">
                Parent Event Linkage ID: <span className="font-mono text-white">{data.event.parent_event_id}</span>.
                Original report record preserved for auditing.
              </p>
            </div>
          )}

          {/* Nearby Reports */}
          {data.nearby_reports.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nearby Independent Reports (&le;50km)</h4>
              <div className="space-y-2">
                {data.nearby_reports.map((nr) => (
                  <div key={nr.event_id} className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs">
                    <div className="flex justify-between font-medium text-gray-300">
                      <span>{nr.city}, {nr.state}</span>
                      <span className="text-[10px] text-gray-500">{new Date(nr.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-1">{nr.raw_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
