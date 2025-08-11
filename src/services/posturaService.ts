import { supabase } from '../config/supabaseClient';
import { Postura } from '../models/postura';

/**
 * Transforma un valor de base de datos en un array de strings
 * Maneja tanto arrays existentes como strings separados por punto y coma
 * 
 * @param valor - Valor a transformar (array o string)
 * @returns Array de strings
 */
const transformarCampoAArray = (valor: any): string[] => {
  if (Array.isArray(valor)) {
    return valor;
  }
  if (typeof valor === 'string' && valor.length > 0) {
    return valor.split(';');
  }
  return [];
};

/**
 * Transforma los datos de postura de la base de datos al modelo de la aplicación
 * Convierte campos de texto separados por punto y coma en arrays
 * 
 * @param dbPostura - Datos de postura desde la base de datos
 * @returns Objeto Postura transformado con campos como arrays
 */
const transformarPostura = (dbPostura: any): Postura => {
  const descripcion = transformarCampoAArray(dbPostura.descripcion);
  const beneficios = transformarCampoAArray(dbPostura.beneficios);
  const modificaciones = transformarCampoAArray(dbPostura.modificaciones);
  const tipoTerapias = transformarCampoAArray(dbPostura.tipoTerapias);

  return {
    id: dbPostura.id,
    nombre: dbPostura.nombre,
    nombreSanskrito: dbPostura.nombreSanskrito ?? '',
    fotoUrl: dbPostura.fotoUrl ?? '',
    videoUrl: dbPostura.videoUrl ?? '',
    descripcion: descripcion,
    beneficios: beneficios,
    modificaciones: modificaciones,
    tipoTerapias: tipoTerapias,
  };
};

/**
 * Obtiene todas las posturas disponibles, opcionalmente filtradas por tipo de terapia
 * 
 * @param tipoTerapia - Tipo de terapia opcional para filtrar posturas
 * @returns Promise que resuelve con un array de posturas
 * @throws Error si hay problemas al obtener las posturas de la base de datos
 */
export async function obtenerTodasLasPosturas(tipoTerapia?: string): Promise<Postura[]> {
  let query = supabase.from('Postura').select('*');

  if (tipoTerapia) {
    query = query.filter('tipoTerapias', 'cs', `["${tipoTerapia}"]`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener posturas:", error);
    throw new Error('No se pudieron obtener las posturas.');
  }

  if (!data) return [];

  return data.map(transformarPostura);
}

/**
 * Obtiene una postura específica por su ID
 * 
 * @param id - ID único de la postura
 * @returns Promise que resuelve con la postura encontrada o undefined si no existe
 * @throws Error si hay problemas en la consulta (excepto cuando no se encuentra)
 */
export async function obtenerPosturaPorId(id: string): Promise<Postura | undefined> {
  const { data, error } = await supabase
    .from('Postura')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error al obtener postura por ID:", error);
    if (error.code === 'PGRST116') return undefined;
    throw new Error('Error en la consulta de postura.');
  }

  if (!data) return undefined;

  return transformarPostura(data);
}