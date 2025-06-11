import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzauksznvezwjawzakay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6YXVrc3pudmV6d2phd3pha2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDgzODgsImV4cCI6MjA2NDYyNDM4OH0.ArpynC8aemGO7KnKgyaPAJYyqBoiKBG8qaFkUHhMqNc';

export const supabase = createClient(supabaseUrl, supabaseKey);