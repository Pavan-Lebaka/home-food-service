import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient = null;

if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Supabase] Initialized client for', env.SUPABASE_URL);
  } catch (error) {
    console.error('[Supabase] Initialization failed:', error.message);
  }
} else {
  console.warn('[Supabase] Credentials not provided; Supabase client skipped.');
}

export const supabase = supabaseClient;

/**
 * Health check for Supabase database connection
 */
export async function checkSupabaseHealth() {
  if (!supabase) {
    return { connected: false, reason: 'Supabase credentials missing' };
  }
  try {
    const { data, error } = await supabase.from('orders').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet, but connection is alive if code indicates database responded
      return { connected: true, tableReady: false, message: error.message };
    }
    return { connected: true, tableReady: true };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}
