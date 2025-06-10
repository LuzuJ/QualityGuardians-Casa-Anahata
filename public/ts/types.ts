export interface Paciente {
  id: string;
  nombre: string;
  correo: string;
  fechaNacimiento: string;
  genero?: string;
  observaciones?: string;
  instructorId: string; // Relación con el instructor autenticado
}

export interface Postura {
  id: string;
  nombreEspanol: string;
  nombreSanskrito?: string;
  fotoUrl: string;
  videoUrl: string;
  instrucciones: string;
  beneficios: string;
  terapiasAsociadas: string[];
}

export interface Serie {
  id: string;
  nombre: string;
  tipoTerapia: string;
  sesionesRecomendadas: number;
  secuencia: Array<{
    idPostura: string;
    duracionMinutos: number;
    // La API debería devolver los detalles de la postura para no tener que hacer otra llamada
    nombreEspanol?: string; 
    fotoUrl?: string;
  }>;
}