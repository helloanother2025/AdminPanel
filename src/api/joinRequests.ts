import { fetchWithBase } from './fetchWithBase';
import type { AdminJoinRequest } from '../adminData';

// Fetch all join requests (admin)
export async function fetchAdminJoinRequests(): Promise<AdminJoinRequest[]> {
  const res = await fetchWithBase('/api/admin/join-requests');
  if (!res.ok) throw new Error('Failed to fetch join requests');
  return res.json();
}
