// Interfaz para el historial de sesiones
export interface HistorialSesion {
  id: string;
  pacienteId: string;
  serieId: string;
  fecha: string;
  dolorInicio: number;
  dolorFin: number;
  comentario: string;
}

// Interfaz Paciente 
export interface Paciente {
  cedula: string;
  nombre: string;
  correo: string;
  fechaNacimiento: string;
  telefono?: string;
}

// Interfaz Postura 
export interface Postura {
  id: string;
  nombre: string; 
  nombreSanskrito?: string;
  fotoUrl: string;
  videoUrl: string;
  instrucciones: string[]; 
  beneficios: string[];    
  tipoTerapias: string[];
}

export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: string;
  sesionesRecomendadas: number;
  secuencia: Array<Postura & { 
    duracionMinutos: number;
  }>;
}

export interface SesionHistorial {
  fecha: string;
  dolorInicio: number;
  dolorFin: number;
  comentario: string;
}