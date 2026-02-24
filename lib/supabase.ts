import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffgchakcjqklnsqjhgxc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2NoYWtjanFrbG5zcWpoZ3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTkzNjAsImV4cCI6MjA4NzQ5NTM2MH0.3T9-EsM1RP9OTnXsa2RBG-uKLpOnCrrObZJTXas3OR0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
