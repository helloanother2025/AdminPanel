import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Admin Data (Keep it consistent with src/adminData.ts for initial sync)
  const mockUsers = [
    { id: 'u1', name: 'Karim Uddin', username: 'karim_u', email: 'karim@example.com', phone: '01711223344', status: 'active', trustScore: 85, joinedAt: '2025-01-10T10:00:00Z', lastActive: '2026-04-16T14:00:00Z' },
    { id: 'u2', name: 'Jamal Hossen', username: 'jamal_h', email: 'jamal@example.com', phone: '01811223344', status: 'warning', trustScore: 45, joinedAt: '2025-05-12T12:00:00Z', lastActive: '2026-04-16T11:00:00Z' },
    { id: 'u3', name: 'Zia Ahmed', username: 'zia_a', email: 'zia@example.com', phone: '01911223344', status: 'suspended', trustScore: 10, joinedAt: '2025-03-20T08:00:00Z', lastActive: '2026-04-10T15:00:00Z' },
  ];

  const mockRides = [
    { id: 'r1', from: 'Mirpur', to: 'Gulshan', creatorId: 'u1', creatorName: 'Karim Uddin', creatorContact: '01711223344', transport: 'Car', departureTime: '2026-04-16T18:00:00Z', seats: 4, currentPassengers: 4, status: 'started', reportCount: 0, flags: [], participantIds: ['u1', 'u2'], fare: 200, currency: 'BDT' },
    { id: 'r2', from: 'Dhanmondi', to: 'Banani', creatorId: 'u2', creatorName: 'Jamal Hossen', creatorContact: '01811223344', transport: 'Car', departureTime: '2026-04-17T09:00:00Z', seats: 3, currentPassengers: 1, status: 'unactive', reportCount: 2, flags: ['suspicious_price'], participantIds: ['u2'], fare: 150, currency: 'BDT' },
  ];

  const mockIncidents = [
    { id: 'inc1', type: 'harassment', severity: 'high', status: 'investigating', description: 'User reported verbal harassment during ride r1.', reportedBy: 'u2', reportedAt: '2026-04-16T09:00:00Z', involvedUsers: ['u1', 'u2'], rideId: 'r1' },
    { id: 'inc2', type: 'panic', severity: 'critical', status: 'open', description: 'Panic button pressed by user u2.', reportedBy: 'u2', reportedAt: '2026-04-16T12:00:00Z', involvedUsers: ['u1', 'u2'], rideId: 'r1' },
  ];

  const mockRepairTasks = [
    { id: 'rt1', type: 'chat_membership', priority: 'high', status: 'pending', description: 'User u2 is in ride r1 but missing from the chat group.', detectedAt: '2026-04-16T10:00:00Z', rideId: 'r1', userId: 'u2' },
  ];

  const mockNotifications = [
    { id: 'n1', type: 'join_request', userId: 'u1', userName: 'Karim Uddin', deliveryStatus: 'delivered', sentAt: '2026-04-16T08:00:00Z', readAt: '2026-04-16T08:05:00Z' },
    { id: 'n2', type: 'payment_request', userId: 'u2', userName: 'Jamal Hossen', deliveryStatus: 'failed', sentAt: '2026-04-16T08:30:00Z', malformed: true },
  ];

  const mockJoinRequests = [
    { id: 'jr1', requesterId: 'u2', requesterName: 'Jamal Hossen', rideId: 'r1', rideName: 'Mirpur → Gulshan', status: 'accepted', paymentStatus: 'paid', requestedAt: '2026-04-16T08:00:00Z', statusHistory: [{ status: 'pending', at: '2026-04-16T08:00:00Z' }, { status: 'accepted', at: '2026-04-16T08:30:00Z' }] }
  ];

  const mockAuditLogs = [
    { id: 'log1', action: 'user_viewed', targetType: 'user', targetId: 'u1', targetName: 'Karim Uddin', reason: 'support_issue', timestamp: new Date().toISOString(), sensitiveAccess: true, ipAddress: '192.168.1.1', adminId: 'admin-1', adminName: 'Super Admin' }
  ];

  // API Routes
  app.get('/api/admin/users', (req, res) => res.json(mockUsers));
  app.get('/api/admin/users/:id', (req, res) => {
    const user = mockUsers.find(u => u.id === req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
  });

  app.get('/api/admin/rides', (req, res) => res.json(mockRides));
  app.get('/api/admin/rides/:id', (req, res) => {
    const ride = mockRides.find(r => r.id === req.params.id);
    if (ride) res.json(ride);
    else res.status(404).json({ error: 'Ride not found' });
  });

  app.get('/api/admin/chats', (req, res) => {
    // Return mock chat records derived from rides
    const chats = mockRides.map(r => ({
      id: `chat-${r.id}`,
      rideId: r.id,
      rideName: `${r.from} → ${r.to}`,
      type: 'group',
      participants: r.participantIds.map(id => mockUsers.find(u => u.id === id)?.name || id),
      messageCount: Math.floor(Math.random() * 50),
      lastActivity: new Date().toISOString(),
      flagCount: r.reportCount,
      reportCount: r.reportCount,
      frozen: r.status === 'frozen'
    }));
    res.json(chats);
  });

  app.get('/api/admin/incidents', (req, res) => res.json(mockIncidents.map(i => ({
    ...i,
    reporterName: mockUsers.find(u => u.id === i.reportedBy)?.name || 'Unknown',
    targetName: mockUsers.find(u => u.id === i.involvedUsers[0])?.name || 'Unknown'
  }))));

  app.post('/api/incidents/:id/resolve', (req, res) => {
    const idx = mockIncidents.findIndex(i => i.id === req.params.id);
    if (idx !== -1) {
      mockIncidents[idx].status = 'resolved';
      res.json({ success: true, incident: mockIncidents[idx] });
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  });

  app.get('/api/admin/repair', (req, res) => res.json(mockRepairTasks.map(t => ({
    ...t,
    name: t.description,
    targetType: 'ride'
  }))));
  app.get('/api/admin/notifications', (req, res) => res.json(mockNotifications));
  app.get('/api/admin/join-requests', (req, res) => res.json(mockJoinRequests));
  app.get('/api/admin/join-requests/:id', (req, res) => {
    const jr = mockJoinRequests.find(j => j.id === req.params.id);
    if (jr) res.json(jr);
    else res.status(404).json({ error: 'Join request not found' });
  });

  app.get('/api/audit-logs', (req, res) => res.json(mockAuditLogs));

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
