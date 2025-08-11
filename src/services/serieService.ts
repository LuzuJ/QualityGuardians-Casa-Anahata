import { supabase } from '../config/supabaseClient';
import { Serie } from '../models/serie';
import { v4 as uuidv4 } from 'uuid';

/**
 * Crea una nueva serie terapéutica en el sistema
 * 
 * @param data - Datos de la serie (excluyendo el ID que se genera automáticamente)
 * @returns Promise que resuelve con la serie creada incluyendo su ID
 * @throws Error si faltan datos obligatorios o hay error al guardar en la base de datos
 */
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

/**
 * Obtiene todas las series terapéuticas disponibles
 * 
 * @returns Promise que resuelve con un array de todas las series
 * @throws Error si hay problemas al obtener las series de la base de datos
 */
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

/**
 * Actualiza los datos de una serie existente
 * 
 * @param id - ID de la serie a actualizar
 * @param data - Datos parciales a actualizar (excluyendo id e instructorId)
 * @returns Promise que resuelve con la serie actualizada
 * @throws Error si la serie no existe o hay error al actualizar
 */
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

/**
 * Obtiene una serie específica por su ID
 * 
 * @param id - ID único de la serie
 * @returns Promise que resuelve con los datos de la serie
 * @throws Error si la serie no existe o hay error en la consulta
 */
export async function obtenerSeriePorId(id: string): Promise<Serie> {
  const { data, error } = await supabase.from('Series').select('*').eq('id', id).single();
  if (error) throw new Error('Serie no encontrada.');
  return data;
}

/**
 * Obtiene todas las series creadas por un instructor específico
 * 
 * @param instructorId - ID del instructor
 * @returns Promise que resuelve con un array de series del instructor
 * @throws Error si hay problemas al obtener las series de la base de datos
 */
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