export interface Paciente {
  id: string; // UUID
  nombre: string;
  correo: string;
  fechaNacimiento: string; // ISO date
  genero?: 'masculino' | 'femenino' | 'otro';
  observaciones?: string;
  instructorId: string; // Relación con el instructor creador
}
