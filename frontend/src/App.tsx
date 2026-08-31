import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { IndiaWeatherMap } from './components/IndiaWeatherMap';
import { FiltersBar } from './components/FiltersBar';
import { EventTable } from './components/EventTable';
import { EventDetailModal } from './components/EventDetailModal';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AdminPanel } from './components/AdminPanel';
import { CitizenReportForm } from './components/CitizenReportForm';
import { WeatherEvent, KPISummary, FilterState } from './types/weather';
import { fetchKPISummary, fetchWeatherEvents, verifyEvent } from './services/api';
import { realtimeManager } from './services/realtime';
import { INITIAL_KPI_SUMMARY } from './data/mockSeedEvents';

export const AppContent: React.FC = () => {
  const [kpis, setKpis] = useState<KPISummary>(INITIAL_KPI_SUMMARY);
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    category: '',
    state: '',
    district: '',
    verificationStatus: '',
    sourceType: '',
    searchQuery: '',
  });

  const loadData = async () => {
    const kpiData = await fetchKPISummary();
    setKpis(kpiData);

    const eventParams: Record<string, string> = {};
    if (filters.category) eventParams.category = filters.category;
    if (filters.state) eventParams.state = filters.state;
    if (filters.verificationStatus) eventParams.verification_status = filters.verificationStatus;
    if (filters.searchQuery) eventParams.search = filters.searchQuery;

    const eventData = await fetchWeatherEvents(eventParams);
    setEvents(eventData);
  };

  useEffect(() => {
    loadData();
    realtimeManager.connect();
    const unsubscribe = realtimeManager.subscribe((msg) => {
      if (msg.event_id) {
        setEvents((prev) => [msg, ...prev]);
      }
    });
    return () => unsubscribe();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'all',
      category: '',
      state: '',
      district: '',
      verificationStatus: '',
      sourceType: '',
      searchQuery: '',
    });
  };

  const handleVerifyEvent = async (eventId: string, status: string) => {
    await verifyEvent(eventId, status);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenReportModal={() => setIsReportModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <KPICards kpis={kpis} />

        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-6">
                <FiltersBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
                <IndiaWeatherMap events={events} onSelectEvent={setSelectedEvent} />
                <EventTable
                  events={events}
                  onSelectEvent={setSelectedEvent}
                  onVerifyEvent={handleVerifyEvent}
                />
              </div>
            }
          />

          <Route path="/analytics" element={<AnalyticsCharts />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          National Weather Big Data Analytics Platform (NWDAP-India) &bull; Government Weather Intelligence System
        </div>
      </footer>

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onVerify={handleVerifyEvent}
      />

      {isReportModalOpen && (
        <CitizenReportForm
          onClose={() => setIsReportModalOpen(false)}
          onSubmitSuccess={loadData}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
