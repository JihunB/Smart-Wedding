import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables.
// We configured vite.config.ts to also accept REACT_APP_ and NEXT_PUBLIC_ prefixes.
const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://vuxuzwsjqpbzhkykidhf.supabase.co';
const supabaseKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_73vaTtB9qqKt29TGc_ZytQ_Oa2Eqx7E';

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase API Keys are missing! Please check your environment variables in Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
