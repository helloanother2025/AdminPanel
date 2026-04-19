import { API_BASE_URL } from './config';

/**
 * Utility for making API calls to the backend, prepending the base URL if needed.
 */
export async function fetchWithBase(input: string, options?: RequestInit) {
  const url = input.startsWith('http') ? input : `${API_BASE_URL}${input}`;
  // Get token from localStorage (assume 'admin_token' key)
  const token = localStorage.getItem('admin_token');
  const headers = {
    ...(options?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, { ...options, headers });
  return response;
}
