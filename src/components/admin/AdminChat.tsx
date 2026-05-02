import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, Snowflake, Eye, Lock, Trash2, VolumeX, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { accessReasons, type ChatRecord } from '../../adminData';
import { fetchWithBase } from '../../api/fetchWithBase';

const mockMessages = [
  { id: 'm1', sender: 'Karim Uddin', text: 'Get in the car or I will leave you behind.', time: '20:45', flagged: true },
  { id: 'm2', sender: 'Jamal Hossen', text: 'You are such a [offensive language removed]', time: '20:47', flagged: true },
  { id: 'm3', sender: 'Karim Uddin', text: 'Fine, your fault then.', time: '20:48', flagged: false },
  { id: 'm4', sender: 'Jamal Hossen', text: 'I know where you live, you better watch yourself.', time: '20:50', flagged: true },
  { id: 'm5', sender: 'Karim Uddin', text: 'Just get out of my ride.', time: '20:51', flagged: false },
];

function ChatDetailModal({ chat, onClose }: { chat: ChatRecord; onClose: () => void }) {
  const [accessReason, setAccessReason] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [deletedMessages, setDeletedMessages] = useState<string[]>([]);
  const [frozen, setFrozen] = useState(chat.frozen);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionsDone, setActionsDone] = useState<string[]>([]);

  const isIncidentChat = (chat.reportCount ?? 0) > 0 || (chat.flagCount ?? 0) > 0;
  const messages = isIncidentChat ? mockMessages : [];

  const handleAction = (action: string) => {
    if (action === 'freeze') setFrozen(true);
    if (action === 'unfreeze') setFrozen(false);
    setActionsDone((p) => [...p, action]);
    setConfirmAction(null);
    setActionReason('');
  };

  const actions = [
    { id: 'freeze', label: 'Freeze Chat', icon: Snowflake, danger: false },
    { id: 'unfreeze', label: 'Unfreeze Chat', icon: CheckCircle2, danger: false },
    { id: 'mute_user', label: 'Mute User', icon: VolumeX, danger: false },
    { id: 'disable_attachments', label: 'Disable Attachments', icon: Lock, danger: false },
    { id: 'disable_dm', label: 'Disable DMs', icon: MessageSquare, danger: true },
    { id: 'close_chat', label: 'Close Chat Room', icon: X, danger: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2A2A2E]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold">{chat.rideName ?? `Chat ${chat.id}`}</h2>
              <span className={`px-2 py-0.5 rounded text-xs ${chat.type === 'group' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/10 text-white/50'}`}>{chat.type}</span>
              {frozen && <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-400 text-xs rounded">Frozen</span>}
            </div>
            <p className="text-white/40 text-sm">ID: {chat.id} · {(chat.participants ?? []).join(', ')}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Level 1 metadata */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Chat Metadata (Level 1)</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Participants', (chat.participants?.length ?? 0)],
                ['Message Count', (chat.messageCount ?? 0)],
                ['Last Activity', chat.lastActivity ? new Date(chat.lastActivity).toLocaleString() : '—'],
                ['Flags', (chat.flagCount ?? 0) > 0 ? `⚠️ ${chat.flagCount}` : '0'],
                ['Reports', (chat.reportCount ?? 0) > 0 ? `🛡️ ${chat.reportCount}` : '0'],
                ['Chat ID', chat.id],
                ['Ride ID', chat.rideId ?? 'Direct'],
              ].map(([k, v], idx) => (
                <div key={`metadata-${idx}`} className="bg-[#1A1A1E] rounded-lg p-3">
                  <p className="text-white/40 text-xs">{k}</p>
                  <p className="text-white text-sm font-medium">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Level 2 incident access */}
          {isIncidentChat && (
            <div className="border border-amber-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-amber-500/10">
                <ShieldAlert size={14} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Incident Review Access (Level 2)</span>
              </div>
              {!accessGranted ? (
                <div className="p-4 space-y-3">
                  <p className="text-white/60 text-xs">This chat has {(chat.reportCount ?? 0)} report(s) and {(chat.flagCount ?? 0)} flagged messages. Full message content requires a valid reason. Access is logged.</p>
                  <select
                    value={accessReason}
                    onChange={(e) => setAccessReason(e.target.value)}
                    className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white/80"
                  >
                    <option value="">Select access reason…</option>
                    {accessReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button
                    onClick={() => { if (accessReason) setAccessGranted(true); }}
                    disabled={!accessReason}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-amber-500/30 transition-colors"
                  >
                    <Eye size={13} /> Grant Incident Access (Logged)
                  </button>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg mb-3">
                    <AlertTriangle size={12} className="text-amber-400" />
                    <p className="text-amber-400/80 text-xs">Access granted · Reason: {accessReason.replace(/_/g, ' ')} · Will expire in 30 min</p>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {messages.filter((m) => !deletedMessages.includes(m.id)).map((msg) => (
                      <div key={msg.id} className={`flex items-start gap-3 p-3 rounded-lg ${msg.flagged ? 'bg-[#E83950]/10 border border-[#E83950]/20' : 'bg-[#1A1A1E]'}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/80 text-xs font-medium">{msg.sender}</span>
                            <span className="text-white/30 text-xs">{msg.time}</span>
                            {msg.flagged && <span className="px-1.5 py-0.5 bg-[#E83950]/20 text-[#E83950] text-xs rounded">Flagged</span>}
                          </div>
                          <p className={`text-sm ${msg.flagged ? 'text-[#E83950]/80' : 'text-white/70'}`}>{msg.text}</p>
                        </div>
                        <button
                          onClick={() => setDeletedMessages((p) => [...p, msg.id])}
                          className="p-1.5 hover:bg-[#E83950]/20 text-white/30 hover:text-[#E83950] rounded transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {messages.filter((m) => !deletedMessages.includes(m.id)).length === 0 && (
                      <p className="text-white/30 text-sm text-center py-4">All flagged messages have been deleted.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin actions */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Moderation Actions</h3>
            {confirmAction ? (
              <div className="p-4 bg-[#1A1A1E] border border-[#E83950]/30 rounded-xl space-y-3">
                <p className="text-white text-sm">Confirm: <span className="text-[#E83950] font-semibold capitalize">{confirmAction.replace(/_/g, ' ')}</span>?</p>
                <input value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Reason…" className="w-full bg-[#111114] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-white" />
                <div className="flex gap-2">
                  <button onClick={() => { if (actionReason) handleAction(confirmAction); }} disabled={!actionReason} className="px-4 py-2 bg-[#E83950] text-white rounded-lg text-xs font-semibold disabled:opacity-40">Confirm</button>
                  <button onClick={() => setConfirmAction(null)} className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {actions.map(({ id, label, icon: Icon, danger }) => (
                  <button
                    key={id}
                    onClick={() => setConfirmAction(id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                      actionsDone.includes(id)
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                        : danger
                        ? 'bg-[#E83950]/10 border-[#E83950]/20 text-[#E83950] hover:bg-[#E83950]/20'
                        : 'bg-white/5 border-[#2A2A2E] text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {actionsDone.includes(id) ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                    {actionsDone.includes(id) ? 'Done' : label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export function AdminChat() {
  const [selected, setSelected] = useState<ChatRecord | null>(null);
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWithBase('/api/admin/chats')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch chats');
        return res.json();
      })
      .then((data) => {
        setChats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat Moderation</h1>
          <p className="text-white/40 text-sm mt-1">Monitor active conversations and resolve flag alerts</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-lg font-bold text-white">{chats.length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Total Chats</p>
           </div>
           <div className="bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl px-4 py-2 text-center">
             <p className="text-lg font-bold text-[#E83950]">{chats.filter(c => c.flagCount > 0).length}</p>
             <p className="text-[10px] uppercase text-white/40 tracking-wider">Flagged</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="text-white/30 text-center py-20">Loading chats…</div>
      ) : error ? (
        <div className="text-red-400 text-center py-20">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={(`p-5 rounded-2xl border bg-[#1A1A1E] transition-all hover:bg-[#23232A] cursor-pointer group ${(chat.flagCount ?? 0) > 0 ? 'border-[#E83950]/30 glow-red' : 'border-[#2A2A2E]'}`)}
              onClick={() => setSelected(chat)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${chat.type === 'group' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-white/40'}`}>
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{chat.rideName ?? `Chat ${chat.id}`}</h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">{chat.type}</p>
                  </div>
                </div>
                {chat.frozen && <Snowflake size={14} className="text-cyan-400" />}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Participants</span>
                  <span className="text-white/60">{(chat.participants?.length ?? 0)} users</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Messages</span>
                  <span className="text-white/60">{chat.messageCount ?? 0} total</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Last Active</span>
                  <span className="text-white/60">{chat.lastActivity ? new Date(chat.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                {(chat.flagCount ?? 0) > 0 && (
                  <span className="px-2 py-1 bg-[#E83950]/20 text-[#E83950] text-[10px] font-bold rounded uppercase">
                     ⚠️ {chat.flagCount} Flags
                  </span>
                )}
                {(chat.reportCount ?? 0) > 0 && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase">
                     🛡️ {chat.reportCount} Reports
                  </span>
                )}
                {(chat.flagCount ?? 0) === 0 && (chat.reportCount ?? 0) === 0 && (
                   <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase">Clean</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ChatDetailModal chat={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
