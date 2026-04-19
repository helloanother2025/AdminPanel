import * as React from 'react';
import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { type SystemNotification } from '../../adminData';
import { fetchNotifications } from '../../api/notifications';

const deliveryColor: Record<string, string> = {
  delivered: 'bg-emerald-500/20 text-emerald-400',
  failed:    'bg-[#E83950]/20 text-[#E83950]',
  pending:   'bg-amber-500/20 text-amber-400',
};

const typeIcon: Record<string, string> = {
  join_request: '📥', friend_request: '👥', ride_update: '🚗',
  join_accepted: '✅', payment_request: '💳', ride_cancelled: '❌',
  panic_alert: '🆘', message: '💬',
};


export function AdminNotifications() {
  const [filter, setFilter] = useState<'all' | 'failed' | 'delivered' | 'pending' | 'issues'>('all');
  const [resentIds, setResentIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [fixedIds, setFixedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchNotifications()
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);

  const issuesFound = notifications.filter((n) => n.deliveryStatus === 'failed' || n.duplicate || n.malformed);

  const filtered = notifications.filter((n) => {
    if (deletedIds.includes(n.id)) return false;
    if (filter === 'all') return true;
    if (filter === 'issues') return n.deliveryStatus === 'failed' || n.duplicate || n.malformed;
    return n.deliveryStatus === filter;
  });

  const stats = {
    delivered: notifications.filter((n) => n.deliveryStatus === 'delivered').length,
    failed:    notifications.filter((n) => n.deliveryStatus === 'failed').length,
    pending:   notifications.filter((n) => n.deliveryStatus === 'pending').length,
    duplicates: notifications.filter((n) => n.duplicate).length,
    malformed:  notifications.filter((n) => n.malformed).length,
  };

  const handleResend = (id: string) => setResentIds((p) => [...p, id]);
  const handleDelete = (id: string) => setDeletedIds((p) => [...p, id]);
  const handleFix = (id: string) => setFixedIds((p) => [...p, id]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications Control</h1>
        <p className="text-white/40 text-sm mt-1">Delivery monitoring and repair</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.delivered}</p>
          <p className="text-xs text-white/40 mt-0.5">Delivered</p>
        </div>
        <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#E83950]">{stats.failed}</p>
          <p className="text-xs text-white/40 mt-0.5">Failed</p>
        </div>
        <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          <p className="text-xs text-white/40 mt-0.5">Pending</p>
        </div>
        <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{stats.duplicates}</p>
          <p className="text-xs text-white/40 mt-0.5">Duplicates</p>
        </div>
        <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{stats.malformed}</p>
          <p className="text-xs text-white/40 mt-0.5">Malformed</p>
        </div>
      </div>

      {/* Issues banner */}
      {issuesFound.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle size={16} className="text-amber-400" />
          <p className="text-amber-400 text-sm">{issuesFound.length} notifications have delivery issues</p>
          <button onClick={() => setFilter('issues')} className="ml-auto text-xs text-amber-400/80 hover:text-amber-400 underline">View Issues</button>
        </div>
      )}

      {/* Quick bulk actions */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] text-white/60 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-colors">
          <RefreshCw size={13} /> Resend All Failed
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] text-white/60 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-colors">
          <Trash2 size={13} /> Delete All Duplicates
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1E] border border-[#2A2A2E] text-white/60 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-colors">
          <CheckCircle2 size={13} /> Repair Unread Counters
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'delivered', 'failed', 'pending', 'issues'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === f ? 'bg-[#E83950]/20 border-[#E83950]/30 text-[#E83950]' : 'bg-[#1A1A1E] border-[#2A2A2E] text-white/50 hover:text-white/80'
            }`}
          >
            {f} {f === 'all' ? `(${notifications.length - deletedIds.length})` : ''}
          </button>
        ))}
      </div>

      {/* Notifications list */}
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
                  {['Type', 'User', 'Status', 'Sent At', 'Read At', 'Issues', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {filtered.map((n) => {
                  const isResent = resentIds.includes(n.id);
                  const isFixed = fixedIds.includes(n.id);
                  const hasIssue = n.deliveryStatus === 'failed' || n.duplicate || n.malformed;

                  return (
                    <tr key={n.id} className={`hover:bg-white/[0.02] transition-colors ${hasIssue && !isFixed ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{typeIcon[n.type] ?? '🔔'}</span>
                          <span className="text-white/70 text-xs">{n.type.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{n.userName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${deliveryColor[isResent ? 'delivered' : n.deliveryStatus]}`}>
                          {isResent ? 'resent' : n.deliveryStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">{new Date(n.sentAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-white/50 text-xs">{n.readAt ? new Date(n.readAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {n.duplicate && !isFixed && <span className="px-1.5 py-0.5 bg-orange-500/15 text-orange-400 text-xs rounded">Duplicate</span>}
                          {n.malformed && !isFixed && <span className="px-1.5 py-0.5 bg-purple-500/15 text-purple-400 text-xs rounded">Malformed</span>}
                          {isFixed && <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-xs rounded flex items-center gap-1"><CheckCircle2 size={10} />Fixed</span>}
                          {!hasIssue && !isFixed && <span className="text-white/30 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {n.deliveryStatus === 'failed' && !isResent && (
                            <button onClick={() => handleResend(n.id)} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/20 transition-colors" title="Resend">
                              <RefreshCw size={12} />
                            </button>
                          )}
                          {(n.duplicate || n.malformed) && !isFixed && (
                            <button onClick={() => handleFix(n.id)} className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded border border-blue-500/20 transition-colors" title="Fix">
                              <CheckCircle2 size={12} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(n.id)} className="p-1.5 bg-[#E83950]/10 hover:bg-[#E83950]/20 text-[#E83950] rounded border border-[#E83950]/20 transition-colors" title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
