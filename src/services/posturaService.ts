import { supabase } from '../config/supabaseClient';
import { Postura } from '../models/postura';

const transformarCampoAArray = (valor: any): string[] => {
  if (Array.isArray(valor)) {
    return valor;
  }
  if (typeof valor === 'string' && valor.length > 0) {
    return valor.split(';');
  }
  return [];
};

const transformarPostura = (dbPostura: any): Postura => {
  const descripcion = transformarCampoAArray(dbPostura.descripcion);
  const beneficios = transformarCampoAArray(dbPostura.beneficios);
  const modificaciones = transformarCampoAArray(dbPostura.modificaciones);
  const tipoTerapias = transformarCampoAArray(dbPostura.tipoTerapias);

  return {
    id: dbPostura.id,
    nombre: dbPostura.nombre,
    nombreSanskrito: dbPostura.nombreSanskrito || '',
    fotoUrl: dbPostura.fotoUrl || '',
    videoUrl: dbPostura.videoUrl || '',
    descripcion: descripcion,
    beneficios: beneficios,
    modificaciones: modificaciones,
    tipoTerapias: tipoTerapias,
  };
};


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