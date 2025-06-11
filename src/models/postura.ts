export interface Postura {
  id: string;
  nombre: string; // nombre en español
  nombreSanskrito?: string;
  tipoTerapias: string[];
  fotoUrl: string;
  videoUrl?: string;
  instrucciones: string[]; 
  beneficios: string[];    
  modificaciones?: string[];
}