export interface Postura {
  id: string;
  nombre: string; 
  nombreSanskrito?: string;
  tipoTerapias: string[];
  fotoUrl: string;
  videoUrl?: string;
  descripcion: string[]; 
  beneficios: string[];    
  modificaciones?: string[];
}