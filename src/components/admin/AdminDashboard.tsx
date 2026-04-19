import * as React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Car, FileText, AlertTriangle, MessageSquare,
  Bell, TrendingUp, TrendingDown, Minus, Activity,
  ShieldAlert, Wrench, CheckCircle2, 
} from 'lucide-react';
import { fetchWithBase } from '../../api/fetchWithBase';
import { useAdmin } from '../../AdminContext';
import { AdminUser, AdminRide, Incident, RepairTask, SystemNotification, AdminJoinRequest } from '../../adminData';
import { fetchActiveRidesChart, fetchReportTypesChart, fetchActiveUsersChart, fetchSystemMetrics } from '../../api/metrics';

const PIE_COLORS = ['#E83950', '#FF6B7A', '#FF9EAA', '#FFCBD0', '#FF4D60'];

function StatCard({ label, value, sub, icon: Icon, color = 'text-white', accent = false }:
  { label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string; accent?: boolean }) {
  return (
    <div className={`bg-[#1A1A1E] border ${accent ? 'border-[#E83950]/30' : 'border-[#2A2A2E]'} rounded-xl p-4 flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? 'bg-[#E83950]/15' : 'bg-white/5'}`}>
        <Icon size={20} className={accent ? 'text-[#E83950]' : 'text-white/60'} />
      </div>
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MetricBar({ metric }: { metric: any }) {
  const statusColor = { good: 'text-emerald-400', warning: 'text-amber-400', critical: 'text-[#E83950]' }[metric.status] ?? 'text-white';
  const barColor = { good: 'bg-emerald-500', warning: 'bg-amber-500', critical: 'bg-[#E83950]' }[metric.status] ?? 'bg-white';
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor = metric.label.includes('Error') ? (metric.trend === 'down' ? 'text-emerald-400' : 'text-[#E83950]') : (metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-[#E83950]' : 'text-white/40');

  return (
    <div className="flex items-center gap-4">
      <span className="text-white/60 text-xs w-44 shrink-0">{metric.label}</span>
      <div className="flex-1 bg-[#2A2A2E] rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${metric.value}%` }} />
      </div>
      <span className={`text-sm font-medium w-16 text-right ${statusColor}`}>{metric.value}{metric.unit}</span>
      <TrendIcon size={12} className={`${trendColor} shrink-0`} />
    </div>
  );
}

const severityColor: Record<string, string> = {
  critical: 'bg-[#E83950]/20 text-[#E83950] border-[#E83950]/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const incidentIcon: Record<string, string> = {
  panic: '🆘', harassment: '⚠️', gender_violation: '🚫', overbooking: '🪑',
  spam: '📧', broken_ride: '🔧', failed_sync: '🔄', abuse_report: '🛡️', fraud: '🔍',
};


export function AdminDashboard() {
  const { isAuthenticated } = useAdmin();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [rides, setRides] = React.useState<AdminRide[]>([]);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [repairs, setRepairs] = React.useState<RepairTask[]>([]);
  const [notifications, setNotifications] = React.useState<SystemNotification[]>([]);
  const [joinRequests, setJoinRequests] = React.useState<AdminJoinRequest[]>([]);
  const [activeRidesChart, setActiveRidesChart] = React.useState<any[]>([]);
  const [reportTypesChart, setReportTypesChart] = React.useState<any[]>([]);
  const [activeUsersChart, setActiveUsersChart] = React.useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([
      fetchWithBase('/api/admin/users').then(r => r.json()),
      fetchWithBase('/api/admin/rides').then(r => r.json()),
      fetchWithBase('/api/admin/incidents').then(r => r.json()),
      fetchWithBase('/api/admin/repair').then(r => r.json()),
      fetchWithBase('/api/admin/notifications').then(r => r.json()),
      fetchWithBase('/api/admin/join-requests').then(r => r.json()),
      fetchActiveRidesChart(),
      fetchReportTypesChart(),
      fetchActiveUsersChart(),
      fetchSystemMetrics(),
    ]).then(([u, r, i, rep, n, jr, arc, rtc, auc, sm]) => {
      setUsers(u);
      setRides(r);
      setIncidents(i);
      setRepairs(rep);
      setNotifications(n);
      setJoinRequests(jr);
      setActiveRidesChart(arc);
      setReportTypesChart(rtc);
      setActiveUsersChart(auc);
      setSystemMetrics(sm);
      setLoading(false);
    }).catch(e => {
      setError('Failed to load dashboard data');
      setLoading(false);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (loading) return <div className="text-white/40 p-8">Loading dashboard…</div>;
  if (error) return <div className="text-[#E83950] p-8">{error}</div>;

  const safeUsers = Array.isArray(users) ? users : [];
  const safeRides = Array.isArray(rides) ? rides : [];
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const safeRepairs = Array.isArray(repairs) ? repairs : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeJoinRequests = Array.isArray(joinRequests) ? joinRequests : [];

  const activeUsersTotal = safeUsers.filter((u) => u.status === 'active').length;
  const flaggedUsersCount = safeUsers.filter((u) => u.status !== 'active' && u.status !== 'warning').length;
  const activeRidesCount = safeRides.filter((r) => r.status === 'unactive' || r.status === 'started').length;
  const openIncidentsCount = safeIncidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;
  const criticalIncidentsCount = safeIncidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const failedNotifsCount = safeNotifications.filter((n) => n.deliveryStatus === 'failed' || n.duplicate || n.malformed).length;
  const brokenRequestsCount = safeJoinRequests.filter((jr) => jr.repairNeeded || jr.status === 'failed').length;
  const pendingRepairsCount = safeRepairs.filter((r) => r.status === 'pending' || r.status === 'in_progress').length;

  const alertFeed = safeIncidents.filter((i) => i.status !== 'resolved').sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  return (
      <div className="space-y-6 max-w-[1400px]">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Control Room</h1>
          <p className="text-white/40 text-sm mt-1">Platform overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {/* Critical banner */}
        {criticalIncidentsCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-[#E83950]/10 border border-[#E83950]/30 rounded-xl">
            <ShieldAlert size={20} className="text-[#E83950] shrink-0" />
            <div>
              <p className="text-[#E83950] font-semibold text-sm">{criticalIncidentsCount} Critical Incident{criticalIncidentsCount > 1 ? 's' : ''} Active</p>
              <p className="text-[#E83950]/70 text-xs">Immediate attention required. Switch to Safety mode to investigate.</p>
            </div>
          </div>
        )}
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active Users" value={activeUsersTotal} sub={`${users.length} total`} icon={Users} />
          <StatCard label="Active Rides" value={activeRidesCount} sub={`${rides.length} total rides`} icon={Car} />
          <StatCard label="Open Incidents" value={openIncidentsCount} sub={`${criticalIncidentsCount} critical`} icon={AlertTriangle} color={criticalIncidentsCount > 0 ? 'text-[#E83950]' : 'text-white'} accent={criticalIncidentsCount > 0} />
          <StatCard label="Failed Notifs" value={failedNotifsCount} sub="delivery issues" icon={Bell} color={failedNotifsCount > 0 ? 'text-amber-400' : 'text-white'} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Broken Requests" value={brokenRequestsCount} sub="need repair" icon={FileText} />
          <StatCard label="Pending Repairs" value={pendingRepairsCount} sub={`${(Array.isArray(repairs) ? repairs : []).filter((r) => r.priority === 'high' && r.status === 'pending').length} high priority`} icon={Wrench} />
          <StatCard label="Restricted Users" value={flaggedUsersCount} sub="non-active status" icon={ShieldAlert} />
          <StatCard label="Chats Under Review" value={incidents.filter(i => i.type === 'harassment').length} sub="frozen/flagged" icon={MessageSquare} />
        </div>
        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rides over 24h */}
          <div className="lg:col-span-2 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-4">
            <h3 className="text-white font-medium text-sm mb-4">Active Rides (Today)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={activeRidesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
                <XAxis dataKey="hour" tick={{ fill: '#666', fontSize: 11 }} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1A1A1E', border: '1px solid #2A2A2E', borderRadius: 8, color: '#fff' }} />
                <Line type="monotone" dataKey="rides" stroke="#E83950" strokeWidth={2} dot={{ fill: '#E83950', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Report types pie */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-4">
            <h3 className="text-white font-medium text-sm mb-4">Report Types</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={reportTypesChart} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {reportTypesChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A1A1E', border: '1px solid #2A2A2E', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#999' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Health + Alerts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System health */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-[#E83950]" />
              <h3 className="text-white font-medium text-sm">System Health</h3>
            </div>
            <div className="space-y-3">
              {systemMetrics.map((m) => <MetricBar key={m.label} metric={m} />)}
            </div>
          </div>
          {/* Alert feed */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-[#E83950]" />
              <h3 className="text-white font-medium text-sm">Live Alert Feed</h3>
              {alertFeed.length > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-[#E83950]/20 text-[#E83950] text-xs rounded-full font-medium">
                  {alertFeed.length}
                </span>
              )}
            </div>
            <div className="space-y-2 overflow-y-auto max-h-64 pr-2">
              {alertFeed.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400 py-4">
                  <CheckCircle2 size={16} />
                  <span className="text-sm">No active alerts</span>
                </div>
              ) : (
                alertFeed.map((inc) => (
                  <div key={inc.id} className={`flex items-start gap-3 p-3 rounded-lg border ${severityColor[inc.severity]}`}>
                    <span className="text-base">{incidentIcon[inc.type] ?? '⚠️'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase">{inc.severity}</span>
                        <span className="text-xs opacity-70 capitalize">{inc.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{inc.description}</p>
                      <p className="text-xs opacity-50 mt-1">{new Date(inc.reportedAt).toLocaleString()}</p>
                    </div>
                    <span className={`ml-auto px-2 py-0.5 text-xs rounded capitalize shrink-0 ${inc.status === 'investigating' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {inc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );

}
