// Este import ahora funcionará porque encontrará el array 'posturas' en el archivo correcto.
import { posturas } from '../database/posturas';
import { Postura } from '../models/postura';

export async function obtenerPosturasPorTerapia(tipo: string): Promise<Postura[]> {
  return posturas.filter(p => p.tipoTerapias.includes(tipo));
}

export async function obtenerTodasLasPosturas(): Promise<Postura[]> {
  return posturas;
}