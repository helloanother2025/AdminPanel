import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, Car, MapPin, Eye, Calendar, User, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { type AdminRide, accessReasons } from '../../adminData';
import { fetchWithBase } from '../../api/fetchWithBase';

const statusConfig: Record<string, { label: string; color: string }> = {
  unactive: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  started:  { label: 'Started', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  ended:    { label: 'Ended',   color: 'bg-white/10 text-white/40 border-white/10' },
};

function RideDetailModal({ ride, onClose }: { ride: AdminRide; onClose: () => void }) {
  const [accessReason, setAccessReason] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sensitiveRide, setSensitiveRide] = useState<Partial<AdminRide> | null>(null);

  const handleGrantAccess = async () => {
    if (!accessReason) return;
    setLoading(true);
    try {
      const res = await fetchWithBase(`/api/admin/rides/${ride.id}?unmask=1&reason=${encodeURIComponent(accessReason)}`);
      if (!res.ok) throw new Error('Failed to fetch sensitive ride data');
      const data = await res.json();
      setSensitiveRide(data);
      setAccessGranted(true);
    } catch (e) {
      alert('Failed to access sensitive data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2A2A2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#E83950]/10 flex items-center justify-center">
               <Car size={20} className="text-[#E83950]" />
             </div>
             <div>
                <h2 className="text-white font-bold text-xl">{ride.from} → {ride.to}</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest">Global Ride ID: {ride.id}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XCircle size={22} className="text-white/30" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
               <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Status</p>
               <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusConfig[ride.status]?.color}`}>
                 {statusConfig[ride.status]?.label}
               </span>
            </div>
            <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
               <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Seats</p>
               <p className="text-white font-bold">{ride.currentPassengers} / {ride.seats}</p>
            </div>
            <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
               <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Creator</p>
               <p className="text-white font-bold text-sm truncate">{ride.creatorName}</p>
            </div>
          </div>

          {/* Location data (Sensitive) */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2E] flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#E83950]" />
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Route & Location Data (Level 2)</span>
              </div>
              {accessGranted && <ShieldCheck size={14} className="text-emerald-400" />}
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500" />
                      <div className="w-px h-10 border-r border-dashed border-[#2A2A2E]" />
                      <MapPin size={12} className="text-[#E83950]" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Origin</p>
                        <p className="text-white/80 text-sm mt-0.5">{accessGranted ? (sensitiveRide?.from ?? ride.from) : ride.from}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Destination</p>
                        <p className="text-white/80 text-sm mt-0.5">{accessGranted ? (sensitiveRide?.to ?? ride.to) : ride.to}</p>
                      </div>
                    </div>
                 </div>

                 {!accessGranted ? (
                   <div className="mt-4 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-3">
                     <p className="text-amber-400/80 text-xs">Precise location data and gender-specific routing triggers are Level 2 data. Access requires an audit-logged reason.</p>
                     <select
                       value={accessReason}
                       onChange={(e) => setAccessReason(e.target.value)}
                       className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white/80"
                     >
                       <option value="">Select reason to unmask…</option>
                       {accessReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                     </select>
                     <button
                        onClick={handleGrantAccess}
                        disabled={!accessReason || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#E83950]/20 border border-[#E83950]/30 text-[#E83950] rounded-xl text-xs font-bold disabled:opacity-30 transition-all hover:bg-[#E83950]/30"
                     >
                       <Eye size={13} /> {loading ? 'Authorizing...' : 'Reveal Precise Data (Logged)'}
                     </button>
                   </div>
                 ) : (
                   <div className="mt-4 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
                      <p className="text-emerald-400 text-xs font-bold mb-3 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Detailed Logic Verified
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Gender Policy</p>
                          <p className="text-emerald-400 text-xs font-medium">Females Only Group</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Security Key</p>
                          <p className="text-white/80 font-mono text-xs">RSA-7734-X</p>
                        </div>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Ride Time & Creation */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
               <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wider mb-2">
                 <Calendar size={12} /> Created At
               </div>
               <p className="text-white/90 text-sm">{new Date().toLocaleString()}</p>
             </div>
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
               <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wider mb-2">
                 <Clock size={12} /> Scheduled For
               </div>
               <p className="text-white/90 text-sm">{new Date(ride.departureTime).toLocaleString()}</p>
             </div>
          </div>

          {/* Administration Actions */}
          <div>
             <h3 className="text-white/60 text-xs uppercase font-bold tracking-widest mb-3">Admin Overrides</h3>
             <div className="flex flex-wrap gap-2">
               <button className="px-4 py-2 bg-[#E83950]/10 border border-[#E83950]/20 text-[#E83950] rounded-xl text-xs font-bold hover:bg-[#E83950]/20 transition-all uppercase tracking-wider">Cancel Ride</button>
               <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-all uppercase tracking-wider">Freeze Join Requests</button>
               <button className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all uppercase tracking-wider">Message Group</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function AdminRides() {
  const [rides, setRides] = useState<AdminRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRide, setSelectedRide] = useState<AdminRide | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unactive' | 'started' | 'ended'>('all');

  useEffect(() => {
    setLoading(true);
    fetchWithBase('/api/admin/rides')
      .then(res => res.json())
      .then(data => {
        setRides(data as any);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch rides data');
        setLoading(false);
      });
  }, []);

  const safeRides = Array.isArray(rides) ? rides : [];
  const filtered = safeRides.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = r.id.toLowerCase().includes(s) || r.from.toLowerCase().includes(s) || r.to.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ride Management</h1>
          <p className="text-white/40 text-sm mt-1">Monitoring {rides.length} active and historic platform rides</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-xl font-bold text-white">{safeRides.filter(r => r.status === 'unactive').length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Active</p>
           </div>
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-xl font-bold text-blue-400">{safeRides.filter(r => r.status === 'started').length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Started</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rides by ID, origin, destination..."
            className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E83950]/40"
          />
        </div>
        <div className="flex gap-2">
           {(['all', 'unactive', 'started', 'ended'] as const).map(f => (
             <button
               key={f}
               onClick={() => setStatusFilter(f)}
               className={`px-4 py-2.5 rounded-xl text-xs font-bold border capitalize transition-all ${statusFilter === f ? 'bg-[#E83950]/15 border-[#E83950]/30 text-[#E83950]' : 'bg-[#1A1A1E] border-[#2A2A2E] text-white/40 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-white/40">Loading rides data...</div>
      ) : error ? (
        <div className="py-20 text-center text-[#E83950]">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ride => (
            <div
              key={ride.id}
              onClick={() => setSelectedRide(ride)}
              className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-3xl p-6 transition-all hover:bg-[#202025] hover:border-[#E83950]/20 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-[#E83950]/10 group-hover:text-[#E83950] transition-colors">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold truncate max-w-[150px]">{ride.from} &rarr; {ride.to}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">ID: {ride.id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig[ride.status]?.color}`}>
                  {statusConfig[ride.status]?.label}
                </span>
              </div>

              <div className="space-y-4">
                 <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-2 h-2 rounded-full border border-emerald-500" />
                      <div className="w-px h-6 border-r border-[#2A2A2E]" />
                      <MapPin size={10} className="text-[#E83950]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/80 text-xs truncate mb-2">{ride.from}</p>
                      <p className="text-white/80 text-xs truncate">{ride.to}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-2 text-white/40">
                      <Calendar size={12} />
                      <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40 justify-end">
                      <User size={12} />
                      <span>{ride.currentPassengers} / {ride.seats} Booked</span>
                    </div>
                 </div>
              </div>

              <button className="w-full mt-6 py-2.5 rounded-xl bg-white/5 group-hover:bg-[#E83950]/10 text-white/30 group-hover:text-[#E83950] text-xs font-bold uppercase tracking-widest transition-all">Inspect Details</button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/20">No rides found matching your query</div>
          )}
        </div>
      )}

      {selectedRide && (
        <RideDetailModal ride={selectedRide} onClose={() => setSelectedRide(null)} />
      )}
    </div>
  );
}
