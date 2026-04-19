import { fetchWithBase } from './fetchWithBase';

export async function fetchIncidents() {
  const res = await fetchWithBase('/api/admin/incidents');
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function resolveIncident(id: string, note: string) {
  const res = await fetchWithBase(`/api/admin/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note })
  });
  if (!res.ok) throw new Error('Failed to resolve incident');
  return res.json();
}
