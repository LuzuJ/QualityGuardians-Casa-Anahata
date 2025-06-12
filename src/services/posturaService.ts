import { supabase } from '../config/supabaseClient';
import { Postura } from '../models/postura';


const transformarCampoAArray = (valor: any): string[] => {
  if (Array.isArray(valor)) {
    return valor; // Si ya es un array (desde un jsonb), lo devuelve tal cual.
  }
  if (typeof valor === 'string' && valor.length > 0) {
    return valor.split(';'); // Si es texto, lo convierte usando el delimitador.
  }
  return []; // Si es nulo o cualquier otra cosa, devuelve un array vacío.
};


const transformarPostura = (dbPostura: any): Postura => {
  // Usamos la nueva función para cada campo que podría ser texto o jsonb
  const beneficios = transformarCampoAArray(dbPostura.beneficios);
  const modificaciones = transformarCampoAArray(dbPostura.modificaciones);
  const instrucciones = transformarCampoAArray(dbPostura.descripcion);
  const tipoTerapias = transformarCampoAArray(dbPostura.tipoTerapias);

  return {
    id: dbPostura.id,
    nombre: dbPostura.nombre,
    nombreSanskrito: dbPostura.nombreSanskrito || '',
    fotoUrl: dbPostura.fotoUrl || '',
    videoUrl: dbPostura.videoUrl || '',
    instrucciones: instrucciones,
    beneficios: beneficios,
    modificaciones: modificaciones,
    tipoTerapias: tipoTerapias,
  };
};


export async function obtenerTodasLasPosturas(): Promise<Postura[]> {
  const { data, error } = await supabase
    .from('Postura') 
    .select('*');  

  if (error) {
    console.error("Error al obtener posturas:", error);
    throw new Error('No se pudieron obtener las posturas.');
  }

  if (!data) return [];

  // Mapeamos sobre los resultados y transformamos cada uno
  return data.map(transformarPostura);
}

export async function obtenerPosturaPorId(id: string): Promise<Postura | undefined> {
  const { data, error } = await supabase
    .from('Postura')
    .select('*')
    .eq('id', id)     
    .single();     

  if (error) {
    console.error("Error al obtener postura por ID:", error);
    // No lanzar error si no se encuentra, solo devolver undefined
    if (error.code === 'PGRST116') return undefined; 
    throw new Error('Error en la consulta de postura.');
  }
  
  if (!data) return undefined;

  // Transformamos el único resultado
  return transformarPostura(data);
}