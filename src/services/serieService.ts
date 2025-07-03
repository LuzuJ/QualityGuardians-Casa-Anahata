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

  const { data: serieCreada, error } = await supabase
    .from('Series') 
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
  const { data, error } = await supabase
    .from('Series')
    .select('*');

  if (error) {
    console.error("Error al obtener las series:", error);
    throw new Error("No se pudieron obtener las series.");
  }

  return data || [];
}

export async function actualizarSerie(id: string, data: Partial<Omit<Serie, 'id' | 'instructorId'>>): Promise<Serie> {
    const { data: serieActualizada, error } = await supabase
      .from('Series')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  
    if (error) {
      console.error("Error al actualizar la serie:", error);
      throw new Error("No se pudo actualizar la serie o no fue encontrada.");
    }
  
    return serieActualizada;
}

export async function obtenerSeriePorId(id: string): Promise<Serie> {
  const { data, error } = await supabase.from('Series').select('*').eq('id', id).single();
  if (error) throw new Error('Serie no encontrada.');
  return data;
}

export async function obtenerSeriesPorInstructor(instructorId: string): Promise<Serie[]> {
  const { data, error } = await supabase
    .from('Series')
    .select('*')
    .eq('instructorId', instructorId); 

  if (error) {
    console.error("Error al obtener las series por instructor:", error);
    throw new Error("No se pudieron obtener las series.");
  }

  return data || [];
}