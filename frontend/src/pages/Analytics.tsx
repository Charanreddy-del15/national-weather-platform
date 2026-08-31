import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, MapPin, PieChart as PieIcon, ShieldCheck, Server } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any>({ state_analytics: [], district_analytics: [] });
  const [catData, setCatData] = useState<any>({ categories: [], severity_distribution: [] });
  const [verifData, setVerifData] = useState<any>({ status_breakdown: [], metrics: {} });
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getTimeline(),
      analyticsService.getGeographic(),
      analyticsService.getEvents(),
      analyticsService.getVerification(),
      analyticsService.getSources(),
    ])
      .then(([t, g, c, v, s]) => {
        setTimeline(t.timeline || []);
        setGeoData(g || {});
        setCatData(c || {});
        setVerifData(v || {});
        setSourceData(s.source_analytics || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-400 animate-pulse">Loading Analytics Data Engine...</div>;
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-800">
        <div className="p-2.5 bg-blue-900/60 rounded-xl border border-blue-700">
          <BarChart3 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl text-gray-100">National Weather Intelligence Analytics</h1>
          <p className="text-xs text-gray-400">Statistical aggregation, temporal event trends, and verification confidence metrics across India</p>
        </div>
      </div>

      {/* Row 1: Time-Series Timeline Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Temporal Event Trend (Daily Frequency)</h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" name="Total Events" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              <Area type="monotone" dataKey="heavy_rain" name="Heavy Rain" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              <Area type="monotone" dataKey="flood" name="Floods" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: State-wise Breakdown & Event Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-wise Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">State-Wise Weather Event Density</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData.state_analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="state" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Bar dataKey="count" name="Event Count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <PieIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Event Category Share</h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData.categories}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.category}
                >
                  {catData.categories?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Verification Trust Metrics & Source Reliability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Accuracy Metrics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Trust Engine Verification Metrics</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Average Trust Score</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{verifData.metrics.avg_trust || 86}%</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Verification Score</span>
              <span className="text-2xl font-black text-blue-400 font-mono">{verifData.metrics.avg_verification || 88}%</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Duplicate Rate</span>
              <span className="text-2xl font-black text-purple-400 font-mono">{verifData.metrics.duplicate_pct || 4.2}%</span>
            </div>
          </div>
        </div>

        {/* Source Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Data Source Ingestion Breakdown</h3>
          </div>
          <div className="space-y-3">
            {sourceData.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-950 p-2.5 rounded-lg border border-gray-800 text-xs">
                <span className="font-semibold text-gray-200">{src.source_type}</span>
                <div className="flex items-center space-x-4 font-mono">
                  <span className="text-gray-400">{src.count} Reports</span>
                  <span className="text-emerald-400 font-bold">Trust {src.avg_trust}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
