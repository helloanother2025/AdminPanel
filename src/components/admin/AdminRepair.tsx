import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, Wrench, AlertTriangle, CheckCircle2, RefreshCw, Layers, ShieldAlert } from 'lucide-react';
import { type RepairTask } from '../../adminData';
import { fetchRepairTasks } from '../../api/repair';

const priorityColor: Record<string, string> = {
  high:   'bg-[#E83950]/20 text-[#E83950]',
  medium: 'bg-amber-500/20 text-amber-400',
  low:    'bg-blue-500/20 text-blue-400',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:     { label: 'Pending',     color: 'bg-white/10 text-white/50', icon: RefreshCw },
  in_progress: { label: 'Working',     color: 'bg-blue-500/20 text-blue-400', icon: RefreshCw },
  completed:   { label: 'Fixed',       color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
  failed:      { label: 'Crit Error',  color: 'bg-red-600/30 text-red-300', icon: AlertTriangle },
};


export function AdminRepair() {
  const [tasks, setTasks] = useState<RepairTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repairingId, setRepairingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchRepairTasks()
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load repair tasks');
        setLoading(false);
      });
  }, []);

  const handleRunRepair = async (id: string) => {
    setRepairingId(id);
    // Simulate repair
    await new Promise((r) => setTimeout(r, 1500));
    setRepairingId(null);
    setCompletedIds((p) => [...p, id]);
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filtered = safeTasks.filter((t) => {
    const q = search.toLowerCase();
    return t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.id.includes(q);
  });

  const highPriorityCount = safeTasks.filter((t) => t.priority === 'high' && !completedIds.includes(t.id)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Repair & Maintenance</h1>
          <p className="text-white/40 text-sm mt-1">Tools to fix common platform data discrepancies</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-lg font-bold text-white">{tasks.length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Total Tasks</p>
           </div>
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center underline-offset-4 underline decoration-[#E83950]">
             <p className="text-lg font-bold text-[#E83950]">{highPriorityCount}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">High Priority</p>
           </div>
        </div>
      </div>

      {highPriorityCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-[#E83950]/10 border border-[#E83950]/20 rounded-xl">
          <ShieldAlert size={20} className="text-[#E83950]" />
          <div>
            <p className="text-[#E83950] font-semibold text-sm">Action Required</p>
            <p className="text-[#E83950]/70 text-xs">{highPriorityCount} critical repairs are pending. These often relate to payment or safety state mismatches.</p>
          </div>
        </div>
      )}

      {/* Global maintenance tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Layers, label: 'Sync User Cache', desc: 'Refresh user profile Redis nodes' },
          { icon: RefreshCw, label: 'Recalculate Ratings', desc: 'Compute ride stats for all users' },
          { icon: Wrench, label: 'Mass Session Clear', desc: 'Logout all users (Emergency)' },
        ].map((tool) => (
          <button key={tool.label} className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl p-4 text-left group hover:border-white/10 transition-all">
            <tool.icon size={20} className="text-[#E83950] mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-white font-semibold text-sm">{tool.label}</p>
            <p className="text-white/40 text-[10px] mt-0.5">{tool.desc}</p>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repair tasks…"
          className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E83950]/40"
        />
      </div>

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
                  {['Task', 'Target Type', 'Priority', 'Status', 'Last Run', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {filtered.map((t) => {
                  const isDone = completedIds.includes(t.id);
                  const isBusy = repairingId === t.id;
                  const st = isDone ? statusConfig.completed : statusConfig[t.status];

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-sm capitalize">{t.type.replace(/_/g, ' ')}</p>
                        <p className="text-white/40 text-xs">ID: {t.id}</p>
                      </td>
                      <td className="px-4 py-3">
                         <span className="px-2 py-0.5 bg-white/5 text-white/50 text-[10px] font-bold uppercase rounded tracking-wider">{t.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityColor[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <st.icon size={12} className={st.color.split(' ')[1] + (isBusy ? ' animate-spin' : '')} />
                          <span className={`${st.color.split(' ')[1]} text-xs`}>{isBusy ? 'Repairing…' : st.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{t.detectedAt ? new Date(t.detectedAt).toLocaleString() : 'Never'}</td>
                      <td className="px-4 py-3">
                        {!isDone && (
                          <button
                            onClick={() => handleRunRepair(t.id)}
                            disabled={isBusy}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-[#E83950]/10 border border-[#2A2A2E] hover:border-[#E83950]/30 text-white/60 hover:text-[#E83950] transition-all disabled:opacity-40`}
                          >
                           {isBusy ? 'Repairing...' : (<><Wrench size={12} /> Run</>)}
                          </button>
                        )}
                        {isDone && (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs px-3 py-1.5">
                            <CheckCircle2 size={12} />
                            Success
                          </div>
                        )}
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
