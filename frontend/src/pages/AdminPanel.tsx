import React, { useEffect, useState } from 'react';
import { adminService, sourceService, authService } from '../services/api';
import { Settings, Server, Hash, Users, ShieldAlert, Cpu, Activity, Plus, RefreshCw, Trash2, CheckCircle2, Lock } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'hashtags' | 'ml' | 'users' | 'audit' | 'health'>('sources');
  const [sources, setSources] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [mlStats, setMlStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newTag, setNewTag] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceType, setNewSourceType] = useState('PUBLIC_API');

  // Auth User
  const currentUser = authService.getCurrentUser();

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [srcRes, tagRes, mlRes, usrRes, logRes, hltRes] = await Promise.allSettled([
        sourceService.getSources(),
        adminService.getHashtags(),
        adminService.getMlStats(),
        adminService.getUsers(),
        adminService.getAuditLogs(),
        adminService.getHealth(),
      ]);

      if (srcRes.status === 'fulfilled') setSources(srcRes.value.sources || []);
      if (tagRes.status === 'fulfilled') setHashtags(tagRes.value.hashtags || []);
      if (mlRes.status === 'fulfilled') setMlStats(mlRes.value);
      if (usrRes.status === 'fulfilled') setUsers(usrRes.value.users || []);
      if (logRes.status === 'fulfilled') setAuditLogs(logRes.value.audit_logs || []);
      if (hltRes.status === 'fulfilled') setHealth(hltRes.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddHashtag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.startsWith('#')) {
      alert('Hashtag must start with #');
      return;
    }
    try {
      await adminService.addHashtag(newTag);
      setNewTag('');
      loadAdminData();
    } catch (e: any) {
      alert('Error adding hashtag: ' + e.message);
    }
  };

  const handleDeleteHashtag = async (id: string) => {
    try {
      await adminService.deleteHashtag(id);
      loadAdminData();
    } catch (e: any) {
      alert('Error deleting hashtag: ' + e.message);
    }
  };

  const handleTriggerPoll = async () => {
    try {
      const res = await sourceService.poll();
      alert(res.message);
      loadAdminData();
    } catch (e: any) {
      alert('Polling error: ' + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-950/80 rounded-xl border border-amber-800">
            <Settings className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-gray-100">Control Room & Admin Engine</h1>
            <p className="text-xs text-gray-400">Source management, hashtag curation, ML telemetry, user RBAC & audit logging</p>
          </div>
        </div>

        <button
          onClick={handleTriggerPoll}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow flex items-center space-x-1.5 border border-blue-400/30"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Manual Poll All Connectors</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-800">
        {[
          { id: 'sources', label: 'Source Connectors', icon: Server },
          { id: 'hashtags', label: 'Social Hashtags', icon: Hash },
          { id: 'ml', label: 'AI/ML Telemetry', icon: Cpu },
          { id: 'users', label: 'User RBAC', icon: Users },
          { id: 'audit', label: 'Audit Logs', icon: Lock },
          { id: 'health', label: 'System Health', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                isActive
                  ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Sources */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Active Ingestion Source Connectors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Source Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Endpoint URL</th>
                    <th className="p-3">Polling Interval</th>
                    <th className="p-3">Reliability</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-sans">
                  {sources.map((src) => (
                    <tr key={src.id} className="hover:bg-gray-850">
                      <td className="p-3 font-semibold text-gray-100">{src.name}</td>
                      <td className="p-3 font-mono text-gray-400 text-[11px]">{src.source_type}</td>
                      <td className="p-3 font-mono text-blue-400 text-[11px] truncate max-w-xs">{src.endpoint_url}</td>
                      <td className="p-3 font-mono">{src.polling_interval_sec}s</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{src.reliability_score}%</td>
                      <td className="p-3">
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hashtags */}
      {activeTab === 'hashtags' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">Add Monitored Weather Hashtag</h3>
            <form onSubmit={handleAddHashtag} className="flex gap-3">
              <input
                type="text"
                placeholder="#Cloudburst"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hashtags.map((ht) => (
              <div key={ht.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between">
                <span className="font-mono font-bold text-blue-400 text-sm">{ht.tag}</span>
                <button onClick={() => handleDeleteHashtag(ht.id)} className="text-rose-400 hover:text-rose-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ML Stats */}
      {activeTab === 'ml' && mlStats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">AI/ML Classification Pipeline Telemetry</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3.5">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Model Engine</span>
              <span className="font-mono font-bold text-indigo-300 text-xs">{mlStats.model_version}</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3.5">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Classification Accuracy</span>
              <span className="font-mono font-black text-emerald-400 text-xl">{mlStats.classification_accuracy}%</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3.5">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Average Confidence</span>
              <span className="font-mono font-black text-blue-400 text-xl">{mlStats.avg_confidence_percent}%</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3.5">
              <span className="text-[10px] text-gray-400 uppercase block mb-1">Human Corrections</span>
              <span className="font-mono font-black text-amber-400 text-xl">{mlStats.human_corrections_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Users RBAC */}
      {activeTab === 'users' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">User Directory & Role-Based Access Control</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-3">User Full Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-sans">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-850">
                  <td className="p-3 font-semibold text-gray-100">{u.full_name}</td>
                  <td className="p-3 font-mono text-gray-300">{u.email}</td>
                  <td className="p-3">
                    <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-500 text-[11px]">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Security & Administrative Audit Log Trail</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-850">
                  <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 text-gray-200 font-bold">{log.user_name}</td>
                  <td className="p-3 text-blue-400">{log.action}</td>
                  <td className="p-3 text-gray-300">{log.entity_type} ({log.entity_id})</td>
                  <td className="p-3 text-gray-500">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: System Health */}
      {activeTab === 'health' && health && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">Real-Time Infrastructure Health</h3>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {health.system_status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Ingestion Throughput</span>
              <span className="text-lg font-bold text-gray-100">{health.events_ingested_per_minute} events/min</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Processing Latency</span>
              <span className="text-lg font-bold text-emerald-400">{health.processing_latency_ms} ms</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Database Engine</span>
              <span className="text-xs font-semibold text-blue-300">{health.database_health}</span>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">Stream Queue</span>
              <span className="text-xs font-semibold text-cyan-300">{health.queue_health}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
