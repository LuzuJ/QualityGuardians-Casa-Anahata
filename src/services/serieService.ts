import { supabase } from '../config/supabaseClient';
import { Serie } from '../models/serie';
import { v4 as uuidv4 } from 'uuid';

export async function crearSerie(data: Omit<Serie, 'id'>): Promise<Serie> {
  if (!data.nombre || !data.tipoTerapia || !data.posturas.length || !data.sesionesRecomendadas) {
    throw new Error('Datos incompletos para la serie');
  }

  const nuevaSerieConId = {
    id: uuidv4(),
    ...data
  };

  // Lógica de Supabase para insertar la nueva serie
  const { data: serieCreada, error } = await supabase
    .from('Series') // Nombre EXACTO de tu tabla en Supabase
    .insert(nuevaSerieConId)
    .select()
    .single();

  if (error) {
    console.error("Error al crear la serie:", error);
    throw new Error("No se pudo crear la serie en la base de datos.");
  }

  return serieCreada;
}

export async function obtenerTodasLasSeries(): Promise<Serie[]> {
  // Lógica de Supabase para seleccionar todas las series
  const { data, error } = await supabase
    .from('Series')
    .select('*');

  if (error) {
    console.error("Error al obtener las series:", error);
    throw new Error("No se pudieron obtener las series.");
  }

  return data || [];
}
