import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAdmin } from '../../AdminContext';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ShieldAlert, 
  MessageSquare, 
  Bell, 
  Wrench, 
  FileText,
  LogOut,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminLayout() {
  const { logout, adminUser } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/rides', icon: Car, label: 'Rides' },
    { to: '/admin/safety', icon: ShieldAlert, label: 'Safety' },
    { to: '/admin/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/admin/moderation', icon: Scale, label: 'Moderation' },
    { to: '/admin/join-requests', icon: FileText, label: 'Join Requests' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { to: '/admin/repair', icon: Wrench, label: 'Repair Tools' },
    { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0C] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2A2A2E] bg-[#111114] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#2A2A2E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E83950] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">BashayJabo</span>
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Control Room</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                isActive 
                  ? "bg-[#E83950]/15 text-[#E83950] font-medium border border-[#E83950]/20" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2A2A2E]">
          <div className="bg-[#1A1A1E] rounded-2xl p-4 flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              {adminUser?.name[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{adminUser?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Level 4 Access</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-[#E83950] hover:bg-[#E83950]/10 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0A0A0C]">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
