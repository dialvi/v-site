import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const ROW_ID = 'main';

export function isRemoteConfigured() {
  return Boolean(url && key);
}

let client: SupabaseClient | null = null;

export function getRemote() {
  if (!isRemoteConfigured()) return null;
  if (!client) client = createClient(url, key);
  return client;
}
