import * as React from 'react';
import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Clock, User, Eye, CheckCircle2, XCircle, Search, Activity, Flag } from 'lucide-react';
import { type Incident, accessReasons } from '../../adminData';
import { fetchIncidents, resolveIncident } from '../../api/incidents';

const severityColor: Record<string, string> = {
  critical: 'bg-[#E83950]/20 text-[#E83950] border-[#E83950]/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const statusColor: Record<string, string> = {
  open:          'bg-white/10 text-white/80',
  investigating: 'bg-blue-500/20 text-blue-400',
  resolved:      'bg-emerald-500/20 text-emerald-400',
};

function IncidentModal({ incident, onClose, onResolved }: { incident: Incident; onClose: () => void; onResolved: (id: string) => void }) {
  const [accessReason, setAccessReason] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    if (!resolveNote) return;
    setLoading(true);
    try {
      await resolveIncident(incident.id, resolveNote);
      onResolved(incident.id);
      onClose();
    } catch (e) {
      alert('Failed to resolve incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2A2A2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${incident.severity === 'critical' ? 'bg-[#E83950]/20 text-[#E83950]' : 'bg-white/10 text-white/50'}`}>
               <ShieldAlert size={20} />
             </div>
             <div>
                <h2 className="text-white font-bold text-xl line-clamp-1">{incident.description}</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">{incident.type.replace('_', ' ')} · {incident.id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XCircle size={22} className="text-white/30" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Severity</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${severityColor[incident.severity]}`}>
                  {incident.severity}
                </span>
             </div>
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor[incident.status]}`}>
                  {incident.status}
                </span>
             </div>
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E] col-span-2">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Reported At</p>
                <p className="text-white text-sm font-medium">{new Date(incident.reportedAt).toLocaleString()}</p>
             </div>
          </div>

          {/* User Links */}
          <div className="flex flex-col md:flex-row gap-3">
             <div className="flex-1 bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wider mb-2">
                  <User size={12} /> Reported By
                </div>
                <div className="flex items-center justify-between">
                   <p className="text-white font-bold">{incident.reporterName}</p>
                   <p className="text-white/30 text-[10px] font-mono">{incident.reporterId}</p>
                </div>
             </div>
             <div className="flex-1 bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wider mb-2">
                  <AlertTriangle size={12} className="text-[#E83950]" /> Target User
                </div>
                <div className="flex items-center justify-between">
                   <p className="text-white font-bold">{incident.targetName}</p>
                   <p className="text-white/30 text-[10px] font-mono">{incident.targetId}</p>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Incident Summary</h3>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-white/80 text-sm leading-relaxed">{incident.description}</p>
             </div>
          </div>

          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2E] flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Historical Context & Logs (Level 2)</span>
              </div>
            </div>
            
            <div className="p-5">
               {!accessGranted ? (
                 <div className="space-y-3 text-center py-4">
                    <p className="text-white/40 text-xs">Accessing historical chat logs or user behavior patterns is Level 2 data. Audit-logged reason required.</p>
                    <div className="flex flex-col gap-2 max-w-sm mx-auto">
                      <select
                        value={accessReason}
                        onChange={(e) => setAccessReason(e.target.value)}
                        className="bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white/80"
                      >
                        <option value="">Select investigation reason…</option>
                        {accessReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      <button
                        onClick={() => { if (accessReason) setAccessGranted(true); }}
                        disabled={!accessReason}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold disabled:opacity-30 transition-all hover:bg-emerald-500/20"
                      >
                        <Eye size={13} /> Grant Investigation Access (Logged)
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                       <p className="text-emerald-400 text-[10px] font-bold uppercase">Evidence Access Granted · Audit ID: TXN-4491</p>
                    </div>
                    <div className="space-y-2">
                       <div className="bg-white/5 p-3 rounded-lg text-[11px] text-white/70 italic">"I'm feeling unsafe, the driver keeps looking back and making comments about my clothes."</div>
                       <div className="flex items-center gap-4 text-[10px] text-white/30">
                          <span className="flex items-center gap-1"><Clock size={10} /> 20:42 PM (EST)</span>
                          <span className="flex items-center gap-1"><Flag size={10} /> Panic Trigger Level 1</span>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2E]">
             {!resolving ? (
               <div className="flex gap-3">
                  <button onClick={() => setResolving(true)} className="flex-1 py-3 bg-[#E83950] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#E83950]/20 hover:scale-[1.02] active:scale-100 transition-all">Mark as Resolved</button>
                  <button className="flex-1 py-3 bg-white/5 border border-[#2A2A2E] text-white/80 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">Request More Info</button>
               </div>
             ) : (
               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Resolution Summary</p>
                  <textarea
                    value={resolveNote}
                    onChange={e => setResolveNote(e.target.value)}
                    placeholder="Provide detailed notes on findings and actions taken..."
                    className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl p-4 text-sm text-white h-24 focus:outline-none focus:border-[#E83950]/40"
                  />
                  <div className="flex gap-2">
                     <button onClick={handleResolve} disabled={!resolveNote || loading} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-40">{loading ? 'Processing...' : 'Confirm Resolution'}</button>
                     <button onClick={() => setResolving(false)} className="flex-1 py-2.5 bg-white/5 text-white/40 rounded-xl text-xs font-bold">Cancel</button>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}


export function AdminSafety() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');

  const fetchAll = () => {
    setLoading(true);
    fetchIncidents()
      .then(data => {
        setIncidents(data as any);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch safety incidents');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = incidents.filter(i => {
    const s = search.toLowerCase();
    const matchSearch = i.description.toLowerCase().includes(s) || i.targetName.toLowerCase().includes(s) || i.reporterName.toLowerCase().includes(s) || i.id.includes(s);
    const matchStatus = filter === 'all' || i.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold text-white">Safety Monitoring</h1>
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#E83950]/15 rounded-full border border-[#E83950]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E83950] animate-pulse" />
                <span className="text-[10px] font-bold text-[#E83950] uppercase tracking-wider">Live</span>
             </div>
           </div>
           <p className="text-white/40 text-sm">{incidents.filter(i => i.status !== 'resolved').length} active investigations</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center underline-offset-4 underline decoration-[#E83950]">
             <p className="text-xl font-bold text-[#E83950]">{incidents.filter(i => i.severity === 'critical').length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Critical</p>
           </div>
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-xl font-bold text-orange-400">{incidents.filter(i => i.severity === 'high').length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">High Risk</p>
           </div>
        </div>
      </div>

      <div className="bg-[#1A1A1E] border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
         <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
           <Activity size={20} className="text-blue-400" />
         </div>
         <div className="flex-1">
            <p className="text-white text-sm font-medium">Real-time Safety Analysis Active</p>
            <p className="text-white/30 text-[11px]">System scanning for panic-triggers, harassment patterns, and route deviations.</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E83950]/40"
          />
        </div>
        <div className="flex gap-2">
           {(['all', 'open', 'investigating', 'resolved'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2.5 rounded-xl text-xs font-bold border capitalize transition-all ${filter === f ? 'bg-[#E83950]/15 border-[#E83950]/30 text-[#E83950]' : 'bg-[#1A1A1E] border-[#2A2A2E] text-white/40 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40 font-mono text-sm">SCANNING INTERFACE...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(inc => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className={`bg-[#1A1A1E] border rounded-3xl p-5 transition-all hover:scale-[1.01] cursor-pointer group flex flex-col ${inc.status === 'resolved' ? 'border-[#2A2A2E] opacity-60' : inc.severity === 'critical' ? 'border-[#E83950]/40 glow-red' : 'border-[#2A2A2E]'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityColor[inc.severity]}`}>
                  {inc.severity}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[inc.status]}`}>
                  {inc.status}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                 <h3 className="text-white font-bold leading-tight line-clamp-2">{inc.description}</h3>
                 <div className="flex items-center gap-3 text-white/40 text-[11px]">
                   <span className="flex items-center gap-1 capitalize"><ShieldAlert size={12} /> {inc.type.replace('_', ' ')}</span>
                   <span className="flex items-center gap-1"><Clock size={12} /> {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">{inc.reporterName[0]}</div>
                   <p className="text-white/40 text-[11px] truncate max-w-[80px]">{inc.reporterName}</p>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-white/40 text-[11px] truncate max-w-[80px]">{inc.targetName}</p>
                   <div className="w-6 h-6 rounded-full bg-[#E83950]/10 flex items-center justify-center text-[10px] font-bold text-[#E83950]">{inc.targetName[0]}</div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <ShieldCheck size={40} className="mx-auto text-emerald-500/20 mb-3" />
              <p className="text-white/20 text-sm">No safety incidents found matching this view</p>
            </div>
          )}
        </div>
      )}

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onResolved={(id) => {
            setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' as const } : inc));
          }}
        />
      )}
    </div>
  );
}
