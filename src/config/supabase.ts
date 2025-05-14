import { createClient } from '@supabase/supabase-js';
import { config } from './environment';

const supabaseUrl = config.SUPABASE_URL || '';
const supabaseAnonKey = config.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = config.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or anon key');
}

// Create a Supabase client with the anon key (for client-side usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase admin client with the service role key (for server-side usage)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;