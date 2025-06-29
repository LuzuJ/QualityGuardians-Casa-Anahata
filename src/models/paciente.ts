export interface Paciente {
  cedula: string;
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
}