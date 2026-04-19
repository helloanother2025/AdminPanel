import { fetchWithBase } from './fetchWithBase';

export async function fetchRepairTasks() {
  const res = await fetchWithBase('/api/admin/repair');
  if (!res.ok) throw new Error('Failed to fetch repair tasks');
  return res.json();
}
