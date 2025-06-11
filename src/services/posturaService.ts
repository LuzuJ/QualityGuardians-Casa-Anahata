import { posturas } from '../database/posturas';
import { Postura } from '../models/postura';

export async function obtenerTodasLasPosturas(): Promise<Postura[]> {
    return posturas;
}

export async function obtenerPosturaPorId(id: string): Promise<Postura | undefined> {
  return posturas.find(p => p.id === id);
}