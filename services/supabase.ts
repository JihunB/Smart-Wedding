import { createClient } from '@supabase/supabase-js';

// Safely access environment variables with optional chaining to prevent crashes
// if import.meta.env is not defined in the current environment.
const env = (import.meta.env || {}) as any;

const supabaseUrl = 
  env.REACT_APP_SUPABASE_URL || 
  env.NEXT_PUBLIC_SUPABASE_URL || 
  env.VITE_SUPABASE_URL || 
  'https://vuxuzwsjqpbzhkykidhf.supabase.co';

const supabaseKey = 
  env.REACT_APP_SUPABASE_ANON_KEY || 
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  env.VITE_SUPABASE_ANON_KEY || 
  'sb_publishable_73vaTtB9qqKt29TGc_ZytQ_Oa2Eqx7E';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase API Keys are missing! Please check your environment variables in Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);