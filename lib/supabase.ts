import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://jposixqotpxzaafnmsjx.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3NpeHFvdHB4emFhZm5tc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDk2MTUsImV4cCI6MjA4NzU4NTYxNX0.RjTWWkrydyezytKP5EwnE2fA9kyhT-STewns14kUTw4';

// Initialize the Supabase client only if the keys are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
