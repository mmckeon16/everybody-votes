import { supabase } from '../supabase';

const backendUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const baseUrl = process.env.EXPO_PUBLIC_ENV === 'development'
  ? 'http://127.0.0.1:54321/functions/v1'
  : `${backendUrl}/functions/v1`;

export async function apiRequest(path: string, options: RequestInit = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`);
  const response = await fetch(`${baseUrl}/${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data;
}
