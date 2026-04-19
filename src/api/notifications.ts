import { fetchWithBase } from './fetchWithBase';

export async function fetchNotifications() {
  const res = await fetchWithBase('/api/admin/notifications');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}
