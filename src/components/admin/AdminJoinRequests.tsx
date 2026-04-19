import * as React from 'react';
import { useState } from 'react';
import { Search, Wrench, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import type { AdminJoinRequest } from '../../adminData';
import { fetchAdminJoinRequests } from '../../api/joinRequests';
import { fetchWithBase } from '../../api/fetchWithBase';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-blue-500/20 text-blue-400' },
  accepted:  { label: 'Accepted',  color: 'bg-emerald-500/20 text-emerald-400' },
  rejected:  { label: 'Rejected',  color: 'bg-[#E83950]/20 text-[#E83950]' },
  cancelled: { label: 'Cancelled', color: 'bg-white/10 text-white/50' },
  expired:   { label: 'Expired',   color: 'bg-white/10 text-white/40' },
  failed:    { label: 'Failed',    color: 'bg-amber-500/20 text-amber-400' },
};

function HistoryTimeline({ history }: { history: { status: string; at: string; reason?: string }[] }) {
  return (
    <div className="relative space-y-2 pl-4">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#2A2A2E]" />
      {history.map((h, i) => (
        <div key={i} className="relative flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-[#E83950] mt-1.5 -ml-4 flex-shrink-0 z-10" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig[h.status]?.color ?? 'bg-white/10 text-white/60'}`}>{h.status}</span>
              <span className="text-white/40 text-xs">{new Date(h.at).toLocaleString()}</span>
            </div>
            {h.reason && <p className="text-white/50 text-xs mt-0.5">{h.reason}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}


function RequestRow({ req }: { req: AdminJoinRequest }) {
  const [expanded, setExpanded] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairReason, setRepairReason] = useState('');
  const [repaired, setRepaired] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [sensitiveReason, setSensitiveReason] = useState('');
  const [sensitiveData, setSensitiveData] = useState<Partial<AdminJoinRequest> | null>(null);
  const [loadingSensitive, setLoadingSensitive] = useState(false);

  const doRepair = () => {
    if (!repairReason) return;
    setRepaired(true);
    setRepairing(false);
  };

  const handleSensitiveAccess = async () => {
    if (!sensitiveReason) return;
    setLoadingSensitive(true);
    try {
      const res = await fetchWithBase(`/api/admin/join-requests/${req.id}?unmask=1&reason=${encodeURIComponent(sensitiveReason)}`);
      if (!res.ok) throw new Error('Failed to fetch sensitive data');
      const data = await res.json();
      setSensitiveData(data);
      setShowSensitive(true);
    } catch (e) {
      alert('Failed to fetch sensitive data');
    } finally {
      setLoadingSensitive(false);
    }
  };

  return (
    <>
      <tr
        className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${req.repairNeeded ? 'bg-amber-500/5' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
            <div>
              <p className="text-white font-medium text-sm">{req.requesterName}</p>
              <p className="text-white/40 text-xs">ID: {req.id}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-white/70 text-sm">{req.rideName}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[req.status]?.color ?? 'bg-white/10 text-white/50'}`}>
            {statusConfig[req.status]?.label ?? req.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs ${req.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {req.paymentStatus}
          </span>
        </td>
        <td className="px-4 py-3 text-white/50 text-xs">{new Date(req.requestedAt).toLocaleString()}</td>
        <td className="px-4 py-3">
          {req.repairNeeded && !repaired && (
            <span className="flex items-center gap-1 text-amber-400 text-xs">
              <AlertTriangle size={12} />Needs Repair
            </span>
          )}
          {repaired && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <CheckCircle2 size={12} />Repaired
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#111114]">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status history */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3">State Machine History</h4>
                <HistoryTimeline history={req.statusHistory} />
                {/* Sensitive Data UI */}
                <div className="mt-4 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <h3 className="text-white/60 text-xs uppercase tracking-wider">Sensitive Join Request Data</h3>
                  </div>
                  {!showSensitive ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-white/40 text-xs">Partner Information</p>
                          <p className="text-white/60 font-mono text-sm">***</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-amber-400/80 text-xs mb-2">Select reason to reveal full data. This access will be logged.</p>
                        <select
                          value={sensitiveReason}
                          onChange={(e) => setSensitiveReason(e.target.value)}
                          className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white/80 mb-2"
                        >
                          <option value="">Select access reason…</option>
                          <option value="fraud_investigation">Fraud Investigation</option>
                          <option value="legal_request">Legal Request</option>
                          <option value="user_safety">User Safety</option>
                        </select>
                        <button
                          onClick={handleSensitiveAccess}
                          disabled={!sensitiveReason || loadingSensitive}
                          className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500/30 transition-colors"
                        >
                          {loadingSensitive ? 'Loading...' : (<><AlertTriangle size={12} className="inline mr-1" /> Reveal Data (Logged)</>)}
                        </button>
                      </div>
                    </>
                  ) : sensitiveData ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg mb-2">
                        <AlertTriangle size={12} className="text-amber-400" />
                        <p className="text-amber-400/80 text-xs">Access logged · Reason: {sensitiveReason.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-white/40 text-xs">Payment Trans ID</p>
                          <p className="text-white font-mono text-sm">TRX-9948271</p>
                        </div>
                      </div>
                      <button onClick={() => { setShowSensitive(false); setSensitiveReason(''); setSensitiveData(null); }} className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 mt-2">
                        Hide data
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Failure + repair */}
              <div className="space-y-3">
                {req.failureReason && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-amber-400 text-xs font-semibold mb-1">Failure Reason</p>
                    <p className="text-amber-400/70 text-xs">{req.failureReason}</p>
                  </div>
                )}

                {req.repairNeeded && !repaired && (
                  <div>
                    <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Repair Tools</h4>
                    {!repairing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setRepairing(true); }}
                          className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/20 transition-colors"
                        >
                          <Wrench size={13} /> Repair Request
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl space-y-2" onClick={(e) => e.stopPropagation()}>
                        <select className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white/80">
                          <option value="">Select repair action…</option>
                          <option>Correct failed acceptance</option>
                          <option>Close duplicate request</option>
                          <option>Repair half-completed state</option>
                          <option>Re-run status update</option>
                        </select>
                        <input
                          value={repairReason}
                          onChange={(e) => setRepairReason(e.target.value)}
                          placeholder="Repair reason…"
                          className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <div className="flex gap-2">
                          <button onClick={doRepair} disabled={!repairReason} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium disabled:opacity-40">Apply Repair</button>
                          <button onClick={() => setRepairing(false)} className="px-3 py-1.5 bg-white/5 text-white/50 rounded-lg text-xs">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {repaired && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <p className="text-emerald-400 text-xs">Request successfully repaired. Logged to audit trail.</p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}


export function AdminJoinRequests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [repairFilter, setRepairFilter] = useState(false);
  const [joinRequests, setJoinRequests] = useState<AdminJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetchAdminJoinRequests()
      .then((data) => {
        setJoinRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load join requests');
        setLoading(false);
      });
  }, []);

  const safeJoinRequests = Array.isArray(joinRequests) ? joinRequests : [];
  const needRepair = safeJoinRequests.filter((r) => r.repairNeeded).length;
  const failedCount = safeJoinRequests.filter((r) => r.status === 'failed').length;

  const filtered = safeJoinRequests.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.requesterName?.toLowerCase().includes(q) || r.rideName?.toLowerCase().includes(q) || r.id.includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchRepair = !repairFilter || r.repairNeeded;
    return matchSearch && matchStatus && matchRepair;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Join Request Management</h1>
        {loading ? (
          <p className="text-white/40 text-sm mt-1">Loading join requests…</p>
        ) : error ? (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        ) : (
          <p className="text-white/40 text-sm mt-1">{joinRequests.length} total requests</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(statusConfig).map(([status, cfg]) => {
          const count = joinRequests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`p-3 rounded-xl border text-center transition-all ${
                statusFilter === status ? 'border-[#E83950]/40 bg-[#E83950]/10' : 'bg-[#1A1A1E] border-[#2A2A2E] hover:border-white/20'
              }`}
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className={`text-xs mt-0.5 ${cfg.color.split(' ')[1]}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {(needRepair > 0 || failedCount > 0) && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Wrench size={16} className="text-amber-400" />
          <p className="text-amber-400 text-sm">
            <span className="font-semibold">{needRepair} requests need repair</span>
            {failedCount > 0 && ` · ${failedCount} in failed state`}
          </p>
          <button
            onClick={() => setRepairFilter(!repairFilter)}
            className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              repairFilter ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-[#2A2A2E] text-white/60'
            }`}
          >
            {repairFilter ? 'Show All' : 'Show Repair Needed'}
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by requester, ride, ID…"
            className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E83950]/40"
          />
        </div>
      </div>

      <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2E]">
                {['Requester', 'Ride', 'Status', 'Payment', 'Requested At', 'Repair'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2E]">
              {filtered.map((req) => <RequestRow key={req.id} req={req} />)}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">No requests match your filters</div>
        )}
      </div>
    </div>
  );
}
