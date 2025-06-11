import { supabase } from '../config/supabaseClient';
import { Postura } from '../models/postura';

export async function obtenerTodasLasPosturas(): Promise<Postura[]> {
  const { data, error } = await supabase
    .from('Postura') 
    .select('*');  

  if (error) {
    console.error("Error al obtener posturas:", error);
    throw new Error('No se pudieron obtener las posturas.');
  }

  return data || [];
}

export async function obtenerPosturaPorId(id: string): Promise<Postura | undefined> {
  const { data, error } = await supabase
    .from('Postura')
    .select('*')
    .eq('id', id)     
    .single();     

  if (error) {
    console.error("Error al obtener postura por ID:", error);
    throw new Error('Postura no encontrada o error en la consulta.');
  }

  return data || undefined;
}