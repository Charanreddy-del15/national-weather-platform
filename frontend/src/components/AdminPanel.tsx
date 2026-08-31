import React, { useState } from 'react';
import { Database, Hash, Cpu, Users, FileText, CheckCircle, XCircle, Plus, Shield } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'hashtags' | 'ml' | 'audit'>('sources');

  const sources = [
    { id: 'src_govt_weather_api', name: 'Open-Meteo & IMD Telemetry', type: 'GOVT_API', interval: 300, status: 'HEALTHY', score: 0.96 },
    { id: 'src_imd_rss_feed', name: 'IMD Official RSS Bulletin Feed', type: 'RSS', interval: 600, status: 'HEALTHY', score: 0.92 },
    { id: 'src_public_social_hashtag', name: 'Public Social Media Stream', type: 'PUBLIC_SOCIAL', interval: 120, status: 'HEALTHY', score: 0.75 },
    { id: 'src_citizen_portal', name: 'National Citizen Reporting Portal', type: 'CITIZEN', interval: 0, status: 'HEALTHY', score: 0.68 },
  ];

  const hashtags = ['#IMD', '#Rain', '#HeavyRain', '#Flood', '#Cyclone', '#Heatwave', '#Storm', '#Lightning', '#Fog', '#DustStorm'];

  const auditLogs = [
    { id: 'aud_101', user: 'Director General', action: 'VERIFY_EVENT', target: 'evt_in_1001', time: '10 mins ago', ip: '10.0.4.12' },
    { id: 'aud_102', user: 'Senior Verifier', action: 'REJECT_EVENT', target: 'evt_in_1006', time: '25 mins ago', ip: '10.0.4.15' },
    { id: 'aud_103', user: 'Director General', action: 'ADD_HASHTAG', target: '#Cloudburst', time: '1 hour ago', ip: '10.0.4.12' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center space-x-4 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'sources' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Source Connectors
        </button>
        <button
          onClick={() => setActiveTab('hashtags')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'hashtags' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Hash className="w-4 h-4" /> Monitored Hashtags
        </button>
        <button
          onClick={() => setActiveTab('ml')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'ml' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" /> ML & Trust Engine
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'audit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Audit Logs
        </button>
      </div>

      {activeTab === 'sources' && (
        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Configured Ingestion Connectors</h4>
          <div className="space-y-3">
            {sources.map((s) => (
              <div key={s.id} className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100 text-sm">{s.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">ID: {s.id} | Polling: {s.interval}s</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-emerald-400">Reliability: {Math.round(s.score * 100)}%</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded font-semibold">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Monitored Social Media Hashtags</h4>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-blue-400 font-mono text-xs rounded-lg flex items-center gap-1">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ml' && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Model Version</span>
            <div className="text-sm font-bold text-slate-100">v1.4.0 (Rule-TFIDF-Transformer Ensemble)</div>
            <div className="text-slate-400 mt-2">Precision: 94.2% | Recall: 91.8% | F1-Score: 93.0%</div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-2.5">User</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Target Entity</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-2.5 font-semibold text-slate-200">{log.user}</td>
                  <td className="p-2.5 font-mono text-cyan-400">{log.action}</td>
                  <td className="p-2.5">{log.target}</td>
                  <td className="p-2.5 text-slate-400">{log.time}</td>
                  <td className="p-2.5 text-slate-500 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
