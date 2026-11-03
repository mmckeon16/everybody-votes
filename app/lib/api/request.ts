import { backendUrl, publicApiKey, supabase } from '../supabase';

const baseUrl = `${backendUrl}/functions/v1`;

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${session?.access_token ?? publicApiKey}`);
  const response = await fetch(`${baseUrl}/${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.error || data.message || `Request failed (${response.status})`, response.status);
  return data;
}
