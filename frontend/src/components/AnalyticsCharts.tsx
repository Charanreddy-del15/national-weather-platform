import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const TIME_SERIES_DATA = [
  { date: 'Aug 25', Rainfall: 120, Flooding: 45, Cyclone: 10, Heatwave: 30 },
  { date: 'Aug 26', Rainfall: 180, Flooding: 60, Cyclone: 15, Heatwave: 25 },
  { date: 'Aug 27', Rainfall: 240, Flooding: 90, Cyclone: 40, Heatwave: 15 },
  { date: 'Aug 28', Rainfall: 310, Flooding: 140, Cyclone: 65, Heatwave: 10 },
  { date: 'Aug 29', Rainfall: 290, Flooding: 120, Cyclone: 50, Heatwave: 20 },
  { date: 'Aug 30', Rainfall: 420, Flooding: 190, Cyclone: 85, Heatwave: 12 },
  { date: 'Aug 31', Rainfall: 380, Flooding: 165, Cyclone: 70, Heatwave: 18 },
];

const STATE_DISTRIBUTION_DATA = [
  { state: 'Maharashtra', count: 340 },
  { state: 'Kerala', count: 290 },
  { state: 'Odisha', count: 245 },
  { state: 'Tamil Nadu', count: 210 },
  { state: 'Delhi-NCR', count: 180 },
  { state: 'Telangana', count: 150 },
  { state: 'Assam', count: 135 },
];

const VERIFICATION_PIE_DATA = [
  { name: 'Verified', value: 65, color: '#10b981' },
  { name: 'Under Review', value: 22, color: '#06b6d4' },
  { name: 'Unverified', value: 8, color: '#f59e0b' },
  { name: 'Flagged', value: 5, color: '#ef4444' },
];

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Chart 1: Time Series Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Weather Event Ingestion Time-Series (7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TIME_SERIES_DATA}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="Rainfall" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Area type="monotone" dataKey="Flooding" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              <Area type="monotone" dataKey="Cyclone" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Bar & Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top States Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Top Affected States & UTs</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATE_DISTRIBUTION_DATA} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="state" type="category" stroke="#64748b" fontSize={11} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Trust Engine Verification Breakdown</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={VERIFICATION_PIE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {VERIFICATION_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
