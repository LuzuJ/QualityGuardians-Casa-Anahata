export interface Sesion {
  id: string;
  dolorInicial: number;
  dolorFinal: number;
  comentario: string;
  pacienteId: string;
  seriesId: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  pausas?: number;
  tiempo_efectivo_minutos?: number;
}