import 'dotenv/config';

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
export const JWT_SECRET = process.env.JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_KEY || !JWT_SECRET) {
  throw new Error("Error: Faltan variables de entorno críticas (Supabase URL/Key o JWT Secret). La aplicación no puede iniciarse de forma segura.");
}