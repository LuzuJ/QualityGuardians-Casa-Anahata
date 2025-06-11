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
  id: string;
  nombre: string;
  correo: string;
  contraseña?: string;
  estado: 'pendiente' | 'activo';
  fechaNacimiento: string;
  telefono?: string;
  genero?: string;
  observaciones?: string;
  instructorId: string;
  serieAsignada?: {
    idSerie: string;
    nombreSerie: string;
    fechaAsignacion: string;
    sesionesRecomendadas: number;
    sesionesCompletadas: number;
  };
  historialSesiones: HistorialSesion[];
}

// Interfaz Postura corregida (con arrays de strings)
export interface Postura {
  nombreEspanol: any;
  terapiasAsociadas: any;
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

// Interfaz Serie completa
export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: string;
  sesionesRecomendadas: number;
  // La secuencia que el paciente ejecutará
  secuencia: Array<{
    idPostura: string;
    duracionMinutos: number;
    // El backend debería enriquecer la secuencia con estos datos
    nombreEspanol?: string; 
    fotoUrl?: string;
  }>;
}