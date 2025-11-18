import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable types (ensures they are not undefined)
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables!");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
