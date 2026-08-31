import React, { useState, useEffect } from 'react';
import { KPICards } from '../components/KPICards';
import { EventFilters } from '../components/EventFilters';
import { MapView } from '../components/MapView';
import { EventDetailDrawer } from '../components/EventDetailDrawer';
import { eventService } from '../services/api';
import { FilterState, SystemStats, WeatherEvent } from '../types';
import { ShieldCheck, Flame, Radio, ExternalLink, RefreshCw } from 'lucide-react';

interface DashboardProps {
  wsConnected: boolean;
  onOpenCitizenModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ wsConnected, onOpenCitizenModal }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [mapEvents, setMapEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    eventCategory: 'ALL',
    state: 'ALL',
    district: 'ALL',
    verificationStatus: 'ALL',
    sourceType: 'ALL',
    minSeverity: 0,
    search: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, eventsData, mapData] = await Promise.all([
        eventService.getStats(),
        eventService.getEvents({ ...filters, limit: 30 }),
        eventService.getMapEvents({
          state: filters.state,
          eventCategory: filters.eventCategory,
          verificationStatus: filters.verificationStatus,
        }),
      ]);

      setStats(statsData);
      setEvents(eventsData.events);
      setMapEvents(mapData);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      eventCategory: 'ALL',
      state: 'ALL',
      district: 'ALL',
      verificationStatus: 'ALL',
      sourceType: 'ALL',
      minSeverity: 0,
      search: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Headline Status Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-gray-900 to-indigo-950 border border-blue-900/60 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between shadow-lg mb-6">
        <div className="flex items-center space-x-3 mb-3 md:mb-0">
          <div className="p-2.5 bg-blue-900/60 rounded-xl border border-blue-700/50">
            <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-gray-100 tracking-tight">
              National Weather Situation Room — India
            </h1>
            <p className="text-xs text-gray-400">
              Aggregating real-time observations from IMD, satellite API feeds, RSS bulletins, social networks & citizen ground reports.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1 border border-gray-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards stats={stats} loading={loading} />

      {/* Interactive Map & Live Stream Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Map View (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Interactive National Geospatial Map
            </h2>
            <span className="text-[11px] font-mono text-blue-400">{mapEvents.length} Event Clusters Plotted</span>
          </div>
          <MapView mapEvents={mapEvents} onSelectEvent={(id) => setSelectedEventId(id)} selectedEventId={selectedEventId || undefined} />
        </div>

        {/* Live Stream / High Alert Feed (1 Col) */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">High Alert Ingestion Feed</span>
            </div>
            <span className="bg-rose-950 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-800">
              REALTIME
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {events.map((evt) => (
              <div
                key={evt.event_id}
                onClick={() => setSelectedEventId(evt.event_id)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  selectedEventId === evt.event_id
                    ? 'bg-blue-950/60 border-blue-500 shadow-md'
                    : 'bg-gray-950 border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      evt.severity >= 0.8
                        ? 'bg-rose-900/80 text-rose-200'
                        : evt.severity >= 0.6
                        ? 'bg-amber-900/80 text-amber-200'
                        : 'bg-blue-900/80 text-blue-200'
                    }`}
                  >
                    {evt.event_category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-gray-200 font-medium line-clamp-2 leading-relaxed mb-2">
                  {evt.raw_text}
                </p>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-800/60">
                  <span className="font-semibold text-gray-300">
                    {evt.city}, {evt.state}
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">Trust {evt.trust_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Engine */}
      <EventFilters filters={filters} onChange={setFilters} onReset={handleResetFilters} />

      {/* Structured Events Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Normalized Weather Event Records ({events.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-mono text-[10px] border-b border-gray-800">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Source</th>
                <th className="p-3">Observation Text</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Trust</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-sans">
              {events.map((evt) => (
                <tr key={evt.event_id} className="hover:bg-gray-850 transition">
                  <td className="p-3 whitespace-nowrap font-mono text-gray-400 text-[11px]">
                    {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-bold text-gray-200">{evt.event_category.replace('_', ' ')}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-medium text-gray-300">
                    {evt.city}, {evt.state}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded font-mono">
                      {evt.source_type}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-gray-300">{evt.raw_text}</td>
                  <td className="p-3 whitespace-nowrap font-mono font-bold">
                    <span className={evt.severity >= 0.8 ? 'text-rose-400' : 'text-amber-400'}>
                      {(evt.severity * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono font-bold text-emerald-400">
                    {evt.trust_score}%
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        evt.verification_status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {evt.verification_status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEventId(evt.event_id)}
                      className="text-blue-400 hover:text-blue-300 font-semibold underline text-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onEventUpdated={loadData}
      />
    </div>
  );
};
