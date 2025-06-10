import { Serie } from '../models/serie';
import { series } from '../database/series';
import { v4 as uuidv4 } from 'uuid';

export async function crearSerie(data: Omit<Serie, 'id'>): Promise<Serie> {
  if (!data.nombre || !data.tipoTerapia || !data.posturas.length || !data.sesionesRecomendadas) {
    throw new Error('Datos incompletos para la serie');
  }

  const nueva: Serie = {
    id: uuidv4(),
    ...data
  };

  series.push(nueva);
  return nueva;
}

export async function obtenerTodasLasSeries(): Promise<Serie[]> {
  // Cuando uses Supabase, aquí irá la llamada a la base de datos
  // await supabase.from('series').select('*');
  return series;
}
