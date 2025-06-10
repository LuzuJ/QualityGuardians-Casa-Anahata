export interface Postura {
  id: string;
  nombre: string; // El nombre en español que ve el usuario
  nombreSanskrito?: string;
  tipoTerapias: string[]; 
  fotoUrl: string;
  videoUrl?: string;
  instrucciones: string[];
  beneficios: string[];
  modificaciones?: string[];
}