import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, User, ShieldAlert, Star, ShieldCheck, Clock, MapPin, Eye, XCircle, AlertTriangle, MoreVertical, Ban, CheckCircle2 } from 'lucide-react';
import { type AdminUser, accessReasons } from '../../adminData';
import { fetchWithBase } from '../../api/fetchWithBase';

const statusColor: Record<string, string> = {
  active:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning:    'bg-amber-500/20 text-amber-400 border-amber-500/30',
  suspended:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  banned:     'bg-[#E83950]/20 text-[#E83950] border-[#E83950]/30',
};

function UserDetailModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [accessReason, setAccessReason] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sensitiveUser, setSensitiveUser] = useState<Partial<AdminUser> | null>(null);

  const handleGrantAccess = async () => {
    if (!accessReason) return;
    setLoading(true);
    try {
      const res = await fetchWithBase(`/api/admin/users/${user.id}?unmask=1&reason=${encodeURIComponent(accessReason)}`);
      if (!res.ok) throw new Error('Failed to fetch sensitive user data');
      const data = await res.json();
      setSensitiveUser(data);
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
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2A2A2E] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold text-white/50">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">{user.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[user.status]}`}>
                   {user.status}
                 </span>
                 <p className="text-white/30 text-[10px] uppercase tracking-widest leading-none">ID: {user.id}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XCircle size={22} className="text-white/30" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Rides Completed</p>
                <div className="flex items-center gap-2">
                   <Clock size={14} className="text-blue-400" />
                   <p className="text-white font-bold">{user.ridesCount}</p>
                </div>
             </div>
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Avg Rating</p>
                <div className="flex items-center gap-2">
                   <Star size={14} className="text-amber-400 fill-amber-400" />
                   <p className="text-white font-bold">{user.rating.toFixed(1)}</p>
                </div>
             </div>
             <div className="bg-[#1A1A1E] rounded-2xl p-4 border border-[#2A2A2E]">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Safety Alerts</p>
                <div className="flex items-center gap-2">
                   <ShieldAlert size={14} className={user.flags > 0 ? 'text-[#E83950]' : 'text-white/30'} />
                   <p className={`text-white font-bold ${user.flags > 5 ? 'text-[#E83950]' : ''}`}>{user.flags}</p>
                </div>
             </div>
          </div>

          {/* Level 2 Metadata (Sensitive) */}
          <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2E] flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#E83950]" />
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Personally Identifiable Information (Level 2)</span>
              </div>
              {accessGranted && <ShieldCheck size={14} className="text-emerald-400" />}
            </div>
            
            <div className="p-5">
               {!accessGranted ? (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Email Address</p>
                        <p className="text-white/50 text-sm font-mono mt-0.5">••••••••••••@••••.com</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Phone Number</p>
                        <p className="text-white/50 text-sm font-mono mt-0.5">••••• ••••••••</p>
                      </div>
                    </div>
                    <div className="pt-2">
                       <p className="text-amber-400/80 text-[11px] mb-3 leading-relaxed">System policy requires an audit-logged reason for PII access. Selecting a reason will notify the lead administrator and record your IP.</p>
                       <div className="flex flex-col sm:flex-row gap-2">
                          <select 
                            value={accessReason} 
                            onChange={(e) => setAccessReason(e.target.value)}
                            className="flex-1 bg-[#111114] border border-[#2A2A2E] rounded-xl px-4 py-2 text-xs text-white/80 focus:outline-none focus:border-[#E83950]/40"
                          >
                             <option value="">Select investigative reason…</option>
                             {accessReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <button
                            onClick={handleGrantAccess}
                            disabled={!accessReason || loading}
                            className="px-4 py-2 bg-[#E83950]/10 border border-[#E83950]/20 text-[#E83950] rounded-xl text-[11px] font-bold hover:bg-[#E83950]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider"
                          >
                            <span className="flex items-center gap-2">
                              <Eye size={13} /> {loading ? 'Authorizing...' : 'Reveal PII'}
                            </span>
                          </button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Email Address</p>
                        <p className="text-white text-sm font-medium mt-0.5">{sensitiveUser?.email ?? user.email}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Phone Number</p>
                        <p className="text-white text-sm font-medium mt-0.5">{sensitiveUser?.phone ?? user.phone}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                       <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Audit Trail: ACCESS_LEVEL_2_LOGGED</p>
                       <p className="text-white/20 text-[10px] font-mono">MD5-HASH: {user.id.slice(0, 8)}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* User History/Stats */}
          <div className="space-y-4">
             <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Global Platform Activity</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Last Active</p>
                   <p className="text-white/90 text-sm font-medium">{new Date(user.lastActive).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Join Date</p>
                   <p className="text-white/90 text-sm font-medium">{new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
             </div>
          </div>

          {/* User Moderation Actions */}
          <div className="pt-4 border-t border-[#2A2A2E]">
             <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Governance Actions</h3>
             <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-white/5 border border-[#2A2A2E] text-white/50 rounded-xl text-xs font-bold hover:bg-[#E83950]/10 hover:text-[#E83950] hover:border-[#E83950]/20 transition-all uppercase tracking-wider">Suspend Account</button>
                <button className="px-4 py-2 bg-white/5 border border-[#2A2A2E] text-white/50 rounded-xl text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all uppercase tracking-wider">Clear Warnings</button>
                <button className="px-4 py-2 bg-[#E83950]/10 border border-[#E83950]/20 text-[#E83950] rounded-xl text-xs font-bold hover:bg-[#E83950]/20 transition-all uppercase tracking-wider">Perma-Ban</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'suspended' | 'banned'>('all');

  useEffect(() => {
    setLoading(true);
    fetchWithBase('/api/admin/users')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(`Failed to fetch user directory (${e.message})`);
        setLoading(false);
      });
  }, []);

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.id.includes(s);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Directory</h1>
          <p className="text-white/40 text-sm mt-1">Managing {safeUsers.length} active platform profiles</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-xl font-bold text-white">{safeUsers.length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Total</p>
           </div>
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-xl font-bold text-[#E83950]">{safeUsers.filter(u => u.flags > 10).length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">At Risk</p>
           </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name, ID, or masked info..."
            className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E83950]/40 transition-all shadow-lg"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
           {(['all', 'active', 'suspended', 'banned'] as const).map(f => (
             <button
               key={f}
               onClick={() => setStatusFilter(f)}
               className={`px-4 py-2.5 rounded-xl text-xs font-bold border capitalize transition-all shrink-0 ${statusFilter === f ? 'bg-[#E83950]/15 border-[#E83950]/30 text-[#E83950]' : 'bg-[#1A1A1E] border-[#2A2A2E] text-white/40 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

       {loading ? (
        <div className="py-20 text-center text-white/40 font-mono text-sm tracking-widest animate-pulse">RECONSTRUCTING DIRECTORY...</div>
       ) : error ? (
        <div className="py-20 text-center text-[#E83950] font-bold">{error}</div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="group relative bg-[#1A1A1E] border border-[#2A2A2E] rounded-3xl p-5 transition-all hover:bg-[#202025] hover:border-[#E83950]/20 cursor-pointer overflow-hidden shadow-md"
            >
              {/* Status Indicator */}
              <div className={`absolute top-0 right-0 w-12 h-12 bg-radial-gradient opacity-0 group-hover:opacity-40 transition-opacity`} style={{ background: `radial-gradient(circle at 100% 0%, ${user.status === 'active' ? '#10B981' : '#E83950'} 0%, transparent 70%)` }} />

              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-lg font-bold text-white/30 group-hover:bg-[#E83950]/10 group-hover:text-[#E83950] transition-all">
                  {user.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold truncate group-hover:text-[#E83950] transition-colors">{user.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'suspended' ? 'bg-orange-500' : 'bg-[#E83950]'}`} />
                    <p className="text-[10px] text-white/30 uppercase tracking-widest uppercase">{user.status}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-[11px]">
                   <span className="text-white/40">Loyalty Tier</span>
                   <span className="text-white/80 font-bold uppercase tracking-wider">{user.rating > 4.5 ? 'Platinum' : 'Standard'}</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                   <span className="text-white/40">Safety Flags</span>
                   <span className={`${user.flags > 0 ? 'text-[#E83950]' : 'text-white/60'} font-bold`}>{user.flags} Alerts</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                   <span className="text-white/40">Last Presence</span>
                   <span className="text-white/60">2h ago</span>
                 </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                 <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#1A1A1E] bg-white/10" />
                    <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#1A1A1E] bg-white/5" />
                 </div>
                 <button className="text-[10px] font-bold text-[#E83950] opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">Profile Card</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/20">No users found in the currently filtered directory</div>
          )}
        </div>
       )}

       {selectedUser && (
         <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
       )}
    </div>
  );
}
