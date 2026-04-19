import { fetchWithBase } from './fetchWithBase';

export async function fetchActiveRidesChart() {
  const res = await fetchWithBase('/api/admin/metrics/active-rides-chart');
  if (!res.ok) throw new Error('Failed to fetch active rides chart');
  return res.json();
}

export async function fetchReportTypesChart() {
  const res = await fetchWithBase('/api/admin/metrics/report-types-chart');
  if (!res.ok) throw new Error('Failed to fetch report types chart');
  return res.json();
}

export async function fetchActiveUsersChart() {
  const res = await fetchWithBase('/api/admin/metrics/active-users-chart');
  if (!res.ok) throw new Error('Failed to fetch active users chart');
  return res.json();
}

export async function fetchSystemMetrics() {
  const res = await fetchWithBase('/api/admin/metrics/system');
  if (!res.ok) throw new Error('Failed to fetch system metrics');
  return res.json();
}
