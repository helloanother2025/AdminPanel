export type AdminUserStatus = 'active' | 'warning' | 'under_review' | 'restricted' | 'suspended' | 'banned' | 'emergency_locked';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: AdminUserStatus;
  trustScore?: number;
  joinedAt?: string;
  lastActive?: string;
  ridesCount?: number;
  rating?: number;
  flags?: number;
  // Moderation fields
  reportCount?: number;
  warningCount?: number;
  lastWarningDate?: string;
  bannedReason?: string;
  bannedDate?: string;
  autoSuspended?: boolean; // True if suspended due to threshold
}

export interface AdminRide {
  id: string;
  from: string;
  to: string;
  creatorId: string;
  creatorName: string;
  creatorContact?: string;
  transport: string;
  departureTime?: string;
  seats?: number;
  currentPassengers?: number;
  status: 'unactive' | 'started' | 'completed' | 'cancelled' | 'expired' | 'frozen';
  reportCount?: number;
  flags?: string[];
  participantIds?: string[];
  fare?: number;
  currency?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  reason: string;
  timestamp: string;
  sensitiveAccess: boolean;
  ipAddress: string;
  adminId: string;
  adminName: string;
  beforeState?: string;
  afterState?: string;
}

export interface ChatRecord {
  id: string;
  rideId?: string;
  rideName?: string;
  type: 'direct' | 'group';
  participants?: string[];
  messageCount?: number;
  lastActivity?: string;
  flagCount?: number;
  reportCount?: number;
  frozen?: boolean;
}

export interface Incident {
  id: string;
  type: 'panic' | 'harassment' | 'gender_violation' | 'overbooking' | 'spam' | 'broken_ride' | 'failed_sync' | 'abuse_report' | 'fraud';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'escalated' | 'resolved';
  description: string;
  reportedBy: string;
  reportedAt: string;
  involvedUsers: string[];
  rideId?: string;
  adminNote?: string;
  reporterName?: string;
  targetName?: string;
  targetId?: string;
  reporterId?: string;
}

export interface RepairTask {
  id: string;
  type: 'chat_membership' | 'seat_count' | 'friend_sync' | 'notification_counter' | 'ride_state' | 'join_state' | 'background_job' | 'cache_clear';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved' | 'failed';
  description: string;
  detectedAt: string;
  rideId?: string;
  userId?: string;
}

export interface SystemNotification {
  id: string;
  type: string;
  userId: string;
  userName: string;
  deliveryStatus: 'delivered' | 'failed' | 'pending';
  sentAt: string;
  readAt?: string;
  duplicate?: boolean;
  malformed?: boolean;
}

export interface AdminJoinRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  rideId: string;
  rideName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired' | 'failed';
  paymentStatus: 'paid' | 'pending';
  requestedAt: string;
  repairNeeded?: boolean;
  failureReason?: string;
  statusHistory: { status: string; at: string; reason?: string }[];
}

export interface SystemMetric {
  label: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

// Moderation & Account Management Interfaces
export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  reporterName: string;
  type: 'harassment' | 'fraud' | 'inappropriate_behavior' | 'safety_concern' | 'payment_issue' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  evidence?: string; // Chat messages, rides involved, etc.
  rideId?: string;
  chatId?: string;
  status: 'open' | 'investigating' | 'substantiated' | 'dismissed';
  reportedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export interface UserWarning {
  id: string;
  userId: string;
  userName: string;
  warningLevel: 1 | 2 | 3; // Level 3 can trigger auto-ban
  reason: string;
  description: string;
  issuedBy: string; // Admin ID
  issuedAt: string;
  expiresAt?: string; // Warnings can expire after 6 months
  active: boolean;
}

export interface ModerationAction {
  id: string;
  targetUserId: string;
  targetUserName: string;
  adminId: string;
  adminName: string;
  actionType: 'warn' | 'suspend' | 'ban' | 'restrict' | 'unban' | 'unsuspend';
  reason: string;
  triggerType: 'manual' | 'auto_threshold' | 'system'; // auto_threshold = exceeded report count
  duration?: string; // e.g., "7 days", "permanent"
  effectiveAt: string;
  expiresAt?: string;
  details?: {
    reportCount?: number;
    warningCount?: number;
    lastIncident?: string;
  };
}

export interface ModerationStats {
  totalReports: number;
  activeReports: number;
  resolvedToday: number;
  usersWithWarnings: number;
  suspendedUsers: number;
  bannedUsers: number;
}

export const accessReasons = [
  { value: 'fraud_investigation', label: 'Fraud Investigation' },
  { value: 'legal_request', label: 'Legal Request' },
  { value: 'user_safety', label: 'User Safety' },
  { value: 'support_issue', label: 'Customer Support' },
];

export const adminUsers: AdminUser[] = [
  { id: 'u1', name: 'Karim Uddin', username: 'karim_u', email: 'karim@example.com', phone: '01711223344', status: 'active', trustScore: 85, joinedAt: '2025-01-10T10:00:00Z', lastActive: '2026-04-16T14:00:00Z', ridesCount: 42, rating: 4.8, flags: 0 },
  { id: 'u2', name: 'Jamal Hossen', username: 'jamal_h', email: 'jamal@example.com', phone: '01811223344', status: 'warning', trustScore: 45, joinedAt: '2025-05-12T12:00:00Z', lastActive: '2026-04-16T11:00:00Z', ridesCount: 15, rating: 3.2, flags: 2 },
  { id: 'u3', name: 'Zia Ahmed', username: 'zia_a', email: 'zia@example.com', phone: '01911223344', status: 'suspended', trustScore: 10, joinedAt: '2025-03-20T08:00:00Z', lastActive: '2026-04-10T15:00:00Z', ridesCount: 5, rating: 2.1, flags: 12 },
];

export const adminRides: AdminRide[] = [
  { id: 'r1', from: 'Mirpur', to: 'Gulshan', creatorId: 'u1', creatorName: 'Karim Uddin', creatorContact: '01711223344', transport: 'Car', departureTime: '2026-04-16T18:00:00Z', seats: 4, currentPassengers: 4, status: 'started', reportCount: 0, flags: [], participantIds: ['u1', 'u2'] },
  { id: 'r2', from: 'Dhanmondi', to: 'Banani', creatorId: 'u2', creatorName: 'Jamal Hossen', creatorContact: '01811223344', transport: 'Car', departureTime: '2026-04-17T09:00:00Z', seats: 3, currentPassengers: 1, status: 'unactive', reportCount: 2, flags: ['suspicious_price'], participantIds: ['u2'] },
];

export const repairTasks: RepairTask[] = [
  { id: 'rt1', type: 'chat_membership', priority: 'high', status: 'pending', description: 'User u2 is in ride r1 but missing from the chat group.', detectedAt: '2026-04-16T10:00:00Z', rideId: 'r1', userId: 'u2' },
];

export const adminJoinRequests: AdminJoinRequest[] = [
  {
    id: 'jr1',
    requesterId: 'u2',
    requesterName: 'Jamal Hossen',
    rideId: 'r1',
    rideName: 'Mirpur → Gulshan',
    status: 'accepted',
    paymentStatus: 'paid',
    requestedAt: '2026-04-16T08:00:00Z',
    statusHistory: [
      { status: 'pending', at: '2026-04-16T08:00:00Z' },
      { status: 'accepted', at: '2026-04-16T08:30:00Z' }
    ]
  }
];
