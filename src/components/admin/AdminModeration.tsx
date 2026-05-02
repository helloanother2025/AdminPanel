import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Shield, Ban, Clock, TrendingUp, User, 
  Filter, Search, CheckCircle2, XCircle, AlertCircle, Eye,
  MoreVertical, Trash2, Lock, Unlock 
} from 'lucide-react';
import { 
  type UserReport, type UserWarning, type ModerationAction, 
  type ModerationStats, type AdminUser 
} from '../../adminData';
import { fetchWithBase } from '../../api/fetchWithBase';

// THRESHOLDS FOR AUTOMATIC ACTIONS
const MODERATION_THRESHOLDS = {
  warningToBan: 3,        // 3 warnings = auto ban
  reportsToBan: 5,        // 5 substantiated reports = consider ban
  daysRetention: 180,     // Warnings expire after 6 months
};

const severityColor: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-[#E83950]/20 text-[#E83950] border-[#E83950]/30',
  medium:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const typeColor: Record<string, string> = {
  harassment:            'bg-[#E83950]/10 text-[#E83950]',
  fraud:                 'bg-red-500/10 text-red-400',
  inappropriate_behavior: 'bg-orange-500/10 text-orange-400',
  safety_concern:        'bg-amber-500/10 text-amber-400',
  payment_issue:         'bg-blue-500/10 text-blue-400',
  other:                 'bg-white/10 text-white/60',
};

function ReportDetailModal({ report, onClose }: { report: UserReport; onClose: () => void }) {
  const [actionType, setActionType] = useState<'warn' | 'ban' | 'dismiss'>('warn');
  const [actionReason, setActionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!actionReason) return;
    setLoading(true);
    try {
      // Call backend to issue warning/ban
      await fetchWithBase(`/api/admin/reports/${report.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, reason: actionReason, notes }),
      });
      onClose();
    } catch (e) {
      alert('Failed to process action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-3xl w-full max-w-xl">
        <div className="p-6 border-b border-[#2A2A2E]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Report Details</h2>
              <p className="text-white/40 text-sm mt-1">ID: {report.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${severityColor[report.severity]}`}>
              {report.severity.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Report Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Reported User</p>
                <p className="text-white font-bold">{report.reportedUserName}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Reporter</p>
                <p className="text-white font-bold">{report.reporterName}</p>
              </div>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Type</p>
              <p className={`px-2 py-1 rounded text-xs font-bold w-fit ${typeColor[report.type]}`}>
                {report.type.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Description</p>
              <p className="text-white/70 text-sm bg-[#1A1A1E] p-3 rounded-lg">{report.description}</p>
            </div>
            {report.evidence && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Evidence</p>
                <p className="text-white/70 text-xs bg-[#1A1A1E] p-3 rounded-lg max-h-24 overflow-y-auto">{report.evidence}</p>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl p-4 space-y-3">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Take Action</p>
            
            <div className="flex gap-2">
              {['warn', 'ban', 'dismiss'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActionType(type as any)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    actionType === type
                      ? `${type === 'ban' ? 'bg-red-500/20 border-red-500/30 text-red-400' : type === 'dismiss' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'} border`
                      : 'bg-white/5 border border-[#2A2A2E] text-white/60'
                  }`}
                >
                  {type === 'warn' && '⚠️'} {type === 'ban' && '🚫'} {type === 'dismiss' && '✓'} {type}
                </button>
              ))}
            </div>

            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={`Reason for ${actionType === 'warn' ? 'warning' : actionType === 'ban' ? 'ban' : 'dismissal'}...`}
              className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
              rows={3}
            />

            {actionType !== 'dismiss' && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes (optional)..."
                className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/20"
                rows={2}
              />
            )}

            <button
              onClick={handleAction}
              disabled={!actionReason || loading}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 ${
                actionType === 'ban'
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                  : 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
              }`}
            >
              {loading ? 'Processing...' : `Confirm ${actionType}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminModeration() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalReports: 0,
    activeReports: 0,
    resolvedToday: 0,
    usersWithWarnings: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'warnings' | 'actions'>('reports');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [reportFilter, setReportFilter] = useState<'all' | 'open' | 'investigating' | 'substantiated'>('open');

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    setLoading(true);
    try {
      const reportsRes = await fetchWithBase('/api/admin/reports');
      const warningsRes = await fetchWithBase('/api/admin/warnings');
      const actionsRes = await fetchWithBase('/api/admin/moderation-actions');

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (warningsRes.ok) setWarnings(await warningsRes.json());
      if (actionsRes.ok) setActions(await actionsRes.json());

      // Calculate stats
      const reportData = await reportsRes.json();
      setStats({
        totalReports: reportData.length,
        activeReports: reportData.filter((r: any) => r.status === 'open').length,
        resolvedToday: reportData.filter((r: any) => 
          new Date(r.resolvedAt || '').toDateString() === new Date().toDateString()
        ).length,
        usersWithWarnings: new Set(await warningsRes.json().then((w: any) => w.map((x: any) => x.userId))).size,
        suspendedUsers: 0, // Fetch from users API
        bannedUsers: 0,    // Fetch from users API
      });
    } catch (e) {
      console.error('Failed to fetch moderation data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white/40">Loading moderation dashboard...</div>;
  }

  const filteredReports = reports.filter(r => reportFilter === 'all' || r.status === reportFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderation & Governance</h1>
        <p className="text-white/40 text-sm mt-1">User reports, warnings, and account management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Reports', value: stats.totalReports, icon: AlertTriangle, color: 'text-white' },
          { label: 'Active', value: stats.activeReports, icon: AlertCircle, color: 'text-[#E83950]' },
          { label: 'Resolved Today', value: stats.resolvedToday, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'With Warnings', value: stats.usersWithWarnings, icon: Shield, color: 'text-amber-400' },
          { label: 'Suspended', value: stats.suspendedUsers, icon: Clock, color: 'text-orange-400' },
          { label: 'Banned', value: stats.bannedUsers, icon: Ban, color: 'text-red-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-3 text-center">
              <Icon size={16} className={`${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[9px] text-white/40 uppercase mt-1 tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2A2A2E]">
        {(['reports', 'warnings', 'actions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold uppercase transition-all border-b-2 ${
              activeTab === tab
                ? 'border-[#E83950] text-[#E83950]'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            {tab === 'reports' && `Reports (${filteredReports.length})`}
            {tab === 'warnings' && `Warnings (${warnings.length})`}
            {tab === 'actions' && `Actions (${actions.length})`}
          </button>
        ))}
      </div>

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'open', 'investigating', 'substantiated'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setReportFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                  reportFilter === filter
                    ? 'bg-[#E83950]/20 border border-[#E83950]/30 text-[#E83950]'
                    : 'bg-white/5 border border-[#2A2A2E] text-white/60 hover:text-white/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-white/40">No reports to display</div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl p-4 hover:border-[#E83950]/20 hover:bg-[#202025] cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold">{report.reportedUserName}</p>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${severityColor[report.severity]}`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs">Reported by {report.reporterName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap ${typeColor[report.type]}`}>
                      {report.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{report.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white/40">{new Date(report.reportedAt).toLocaleDateString()}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="text-[10px] text-white/40 group-hover:text-[#E83950] flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} /> Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* WARNINGS TAB */}
      {activeTab === 'warnings' && (
        <div className="space-y-3">
          {warnings.length === 0 ? (
            <div className="text-center py-12 text-white/40">No active warnings</div>
          ) : (
            warnings
              .filter((w) => w.active)
              .map((warning) => (
                <div
                  key={warning.id}
                  className="bg-[#1A1A1E] border border-amber-500/20 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{warning.userName}</p>
                      <p className="text-white/40 text-xs">Level {warning.warningLevel}/3</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-[9px] font-bold">
                      {warning.warningLevel === 3 ? 'CRITICAL' : 'WARNING'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{warning.reason}</p>
                  <p className="text-[10px] text-white/40">
                    Issued {new Date(warning.issuedAt).toLocaleDateString()} by {warning.issuedBy}
                  </p>
                </div>
              ))
          )}
        </div>
      )}

      {/* ACTIONS TAB */}
      {activeTab === 'actions' && (
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="text-center py-12 text-white/40">No moderation actions</div>
          ) : (
            actions
              .sort((a, b) => new Date(b.effectiveAt).getTime() - new Date(a.effectiveAt).getTime())
              .slice(0, 50)
              .map((action) => (
                <div
                  key={action.id}
                  className={`bg-[#1A1A1E] border rounded-2xl p-4 ${
                    action.actionType === 'ban' ? 'border-red-500/20' : 'border-[#2A2A2E]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{action.targetUserName}</p>
                      <p className="text-white/40 text-xs">by {action.adminName}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap ${
                        action.actionType === 'ban'
                          ? 'bg-red-500/20 text-red-400'
                          : action.actionType === 'suspend'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {action.actionType}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{action.reason}</p>
                  <p className="text-[10px] text-white/40">
                    {new Date(action.effectiveAt).toLocaleDateString()}
                    {action.triggerType === 'auto_threshold' && ' • Auto-triggered'}
                  </p>
                </div>
              ))
          )}
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}
