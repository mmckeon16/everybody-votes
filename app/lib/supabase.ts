import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const backendUrl = (
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://everybody-polls-api.onrender.com'
).replace(/\/+$/, '');
export const publicApiKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'everybody-polls-public';

export const authStorageKey = `sb-${new URL(backendUrl).hostname.split('.')[0]}-auth-token`;

export const supabase = createClient(backendUrl, publicApiKey, {
  auth: {
    storage: AsyncStorage,
    storageKey: authStorageKey,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export default supabase;
