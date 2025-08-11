import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './env';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Las variables de entorno de Supabase (URL y KEY) no están definidas.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);