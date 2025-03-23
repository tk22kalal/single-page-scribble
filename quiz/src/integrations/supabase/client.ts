
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.info('Using fallback values for development. This should be configured properly in production.');
}

// Use environment variables if available, otherwise use fallback values
const SUPABASE_URL = supabaseUrl || "https://bcxedciqvragvaofsshg.supabase.co";
const SUPABASE_KEY = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjeGVkY2lxdnJhZ3Zhb2Zzc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTIwODQsImV4cCI6MjA1NDA4ODA4NH0.ShMcbaxtwisxrXor5_zbHkvBMhNx4l_EDJ8iA2_3adU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
