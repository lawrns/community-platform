"use client";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

// Singleton instance of Supabase client for use in components
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

// Type definitions for Supabase tables
export type Tables = {
  users: {
    Row: {
      id: string;
      email: string;
      username: string;
      display_name: string | null;
      bio: string | null;
      avatar_url: string | null;
      website: string | null;
      reputation: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id: string;
      email: string;
      username: string;
      display_name?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      website?: string | null;
      reputation?: number;
    };
    Update: {
      id?: string;
      email?: string;
      username?: string;
      display_name?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      website?: string | null;
      reputation?: number;
      updated_at?: string;
    };
  };
  
  // Add additional table types here as needed
};