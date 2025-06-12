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

// Interfaz Paciente completa
export interface Paciente {
  cedula: string;
  nombre: string;
  correo: string;
  fechaNacimiento: string;
  telefono?: string;
}

// Interfaz Postura corregida (con arrays de strings)
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

// Interfaz Serie completa
export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: string;
  sesionesRecomendadas: number;
  secuencia: Array<{
    idPostura: string;
    duracionMinutos: number;
    nombreEspanol?: string; 
    fotoUrl?: string;
  }>;
}

export interface SesionHistorial {
  fecha: string;
  dolorInicio: number;
  dolorFin: number;
  comentario: string;
}