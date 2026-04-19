import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, Shield, Eye, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { type AuditLogEntry } from '../../adminData';
import { fetchAuditLogs } from '../../api/auditLogs';

const actionColors: Record<string, string> = {
  user_viewed:          'bg-white/10 text-white/50',
  ride_cancelled:       'bg-[#E83950]/20 text-[#E83950]',
  chat_opened:          'bg-amber-500/20 text-amber-400',
  location_viewed:      'bg-orange-500/20 text-orange-400',
  account_suspended:    'bg-[#E83950]/20 text-[#E83950]',
  account_banned:       'bg-red-900/40 text-red-400',
  account_restored:     'bg-emerald-500/20 text-emerald-400',
  notification_resent:  'bg-blue-500/20 text-blue-400',
  join_request_repaired:'bg-yellow-500/20 text-yellow-400',
  message_deleted:      'bg-purple-500/20 text-purple-400',
  ride_frozen:          'bg-cyan-500/20 text-cyan-400',
  ride_repaired:        'bg-yellow-500/20 text-yellow-400',
  user_restricted:      'bg-orange-500/20 text-orange-400',
  user_warned:          'bg-amber-500/20 text-amber-400',
  emergency_override:   'bg-red-600/30 text-red-300',
  data_exported:        'bg-purple-600/20 text-purple-300',
  session_revoked:      'bg-[#E83950]/20 text-[#E83950]',
  report_reviewed:      'bg-blue-500/20 text-blue-400',
};

const targetTypeIcon: Record<string, string> = {
  user: '👤', ride: '🚗', chat: '💬', request: '📋', notification: '🔔', system: '⚙️',
};

const reasonColors: Record<string, string> = {
  safety_incident: 'text-[#E83950]', abuse_report: 'text-orange-400',
  support_issue: 'text-blue-400', fraud_investigation: 'text-purple-400',
  system_repair: 'text-yellow-400', legal_compliance: 'text-white/60',
};

function LogRow({ log }: { log: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown size={13} className="text-white/30" /> : <ChevronRight size={13} className="text-white/30" />}
            <span className="text-white/50 text-xs font-mono">{log.id}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] ?? 'bg-white/10 text-white/50'}`}>
            {log.action.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span>{targetTypeIcon[log.targetType] ?? '📄'}</span>
            <div>
              <p className="text-white/80 text-xs">{log.targetName}</p>
              <p className="text-white/40 text-xs">{log.targetId}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs ${reasonColors[log.reason] ?? 'text-white/50'}`}>
            {log.reason.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-4 py-3 text-white/50 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
        <td className="px-4 py-3">
          {log.sensitiveAccess && (
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Eye size={12} />
              <span>Sensitive</span>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-white/40 text-xs font-mono">{log.ipAddress}</td>
      </tr>
      {expanded && (
        <tr className="bg-[#111114] border-b border-[#2A2A2E]">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Admin</p>
                <p className="text-white text-sm">{log.adminName}</p>
                <p className="text-white/40 text-xs">{log.adminId}</p>
              </div>
              {log.beforeState && (
                <div>
                  <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">State Change</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-[#E83950]/10 text-[#E83950] rounded">{log.beforeState}</span>
                    <span className="text-white/30">→</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">{log.afterState}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Timestamp</p>
                <p className="text-white text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                <p className="text-white/40 text-xs">{log.ipAddress}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}


export function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAuditLogs()
      .then((data) => {
        setAuditLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load audit logs');
        setLoading(false);
      });
  }, []);

  const sensitiveCount = auditLogs.filter((l) => l.sensitiveAccess).length;
  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action))) as string[];
  const filtered = auditLogs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = l.targetName.toLowerCase().includes(q) || l.action.includes(q) || l.reason.includes(q) || l.id.includes(q);
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    const matchSensitive = !sensitiveOnly || l.sensitiveAccess;
    return matchSearch && matchAction && matchSensitive;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-white/40 text-sm mt-1">Immutable record of all admin actions</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] text-white/60 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-colors">
          <Download size={13} /> Export (Logged)
        </button>
      </div>

      {sensitiveCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Eye size={15} className="text-amber-400" />
          <p className="text-amber-400 text-sm">{sensitiveCount} sensitive access events in this period</p>
          <button
            onClick={() => setSensitiveOnly(!sensitiveOnly)}
            className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sensitiveOnly ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-[#2A2A2E] text-white/60'}`}
          >
            {sensitiveOnly ? 'Show All' : 'Sensitive Only'}
          </button>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-2 p-3 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl">
        <Shield size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
        <p className="text-white/40 text-xs">Audit logs are immutable. All admin actions, especially sensitive data access, are recorded here permanently. Logs cannot be edited or deleted.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E83950]/40"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-3 py-2.5 text-sm text-white/80 focus:outline-none"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-white/30 text-sm">Loading…</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400 text-sm">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2E]">
                  {['Log ID', 'Action', 'Target', 'Reason', 'Timestamp', 'Sensitive', 'IP'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {filtered.map((log) => <LogRow key={log.id} log={log} />)}
              </tbody>
            </table>
          )}
          {filtered.length === 0 && !loading && !error && (
            <div className="text-center py-12 text-white/30 text-sm">No logs match your filters</div>
          )}
        </div>
      </div>

      <p className="text-center text-white/20 text-xs mt-4">
        Audit logs are append-only and cannot be modified. Showing current period logs.
      </p>
    </div>
  );
}
