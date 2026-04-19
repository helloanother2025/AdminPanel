import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../AdminContext';
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

export function AdminLogin() {
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authed, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate delay
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(password);
    setLoading(false);
    if (ok) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-radial-gradient opacity-40" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(232,57,80,0.15) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111114] border border-[#2A2A2E] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E83950]/10 border border-[#E83950]/20 mb-6 group transition-all hover:scale-105">
              <ShieldCheck size={32} className="text-[#E83950]" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">BashayJabo</h1>
            <p className="text-white/40 text-sm mt-2 font-medium uppercase tracking-[0.2em]">Admin Control Room</p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl mb-8">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-500/70 text-[11px] leading-relaxed font-medium">
              ESTRICTED ACCESS. All admin actions, including failed attempts, are logged permanently for audit. Unauthorized access attempts trigger automated system blocks.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
                Security Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-[#1A1A1E] border border-[#2A2A2E] rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder-white/10 focus:outline-none focus:border-[#E83950]/40 transition-all focus:ring-1 focus:ring-[#E83950]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-white/10 text-[10px] ml-1 pt-1 italic font-mono">Hint: admin2026</p>
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-3 p-4 bg-[#E83950]/10 border border-[#E83950]/20 rounded-2xl">
                <AlertCircle size={16} className="text-[#E83950]" />
                <p className="text-[#E83950] text-xs font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 bg-[#E83950] hover:bg-[#FF4D60] text-white font-bold rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#E83950]/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity={0.2} />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Authorizing…
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/10 text-[10px] mt-8 uppercase tracking-[0.3em] font-bold">
          System v1.0.42 · Build 404
        </p>
      </div>
    </div>
  );
}
