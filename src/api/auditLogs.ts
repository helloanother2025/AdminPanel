import { fetchWithBase } from './fetchWithBase';

export async function fetchAuditLogs() {
  const res = await fetchWithBase('/api/admin/audit-logs');
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
