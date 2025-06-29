// public/ts/types.ts

// Interfaz para una sesión individual en el historial
export interface Sesion {
  id: string;
  dolorInicial: number;
  dolorFinal: number;
  comentario: string;
  pacienteId: string;
  serieId: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  pausas?: number;
  tiempo_efectivo_minutos?: number;
}

// Interfaz para los datos de un Paciente
export interface Paciente {
  cedula: string;
  nombre: string;
  correo: string;
  telefono?: string;
  fechaNacimiento: string;
  // Propiedad para la serie asignada (¡ahora está aquí!)
  serieAsignada?: {
    nombreSerie: string;
    sesionesCompletadas: number;
    sesionesRecomendadas: number;
  };
}

// Interfaz para una Postura
export interface Postura {
  id: string;
  nombre: string; 
  nombreSanskrito?: string;
  fotoUrl: string;
  videoUrl: string;
  descripcion: string[];
  beneficios: string[];    
  tipoTerapias: string[];
}

// Interfaz para una Serie (usada en la creación y edición)
export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: string;
  sesionesRecomendadas: number;
  posturas: {
      idPostura: string;
      duracionMinutos: number;
  }[];
  // Usado para mostrar posturas completas en la ejecución
  secuencia?: Array<Postura & { 
    duracionMinutos: number;
  }>;
}