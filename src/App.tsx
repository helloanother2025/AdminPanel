import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AdminProvider, useAdmin } from './AdminContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminRides } from './components/admin/AdminRides';
import { AdminSafety } from './components/admin/AdminSafety';
import { AdminChat } from './components/admin/AdminChat';
import { AdminModeration } from './components/admin/AdminModeration';
import { AdminJoinRequests } from './components/admin/AdminJoinRequests';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminRepair } from './components/admin/AdminRepair';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect to admin login or dash */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          
          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="rides" element={<AdminRides />} />
            <Route path="safety" element={<AdminSafety />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="join-requests" element={<AdminJoinRequests />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="repair" element={<AdminRepair />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}
