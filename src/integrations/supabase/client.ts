import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtagvcnhbglvdpgjlvtm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YWd2Y25oYmdsdmRwZ2psdnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTc3NjQsImV4cCI6MjA3NjkzMzc2NH0.C4sDLT2ApECNlUmkGvrNmwRk80CE9tHWuBReEWe_gE4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
