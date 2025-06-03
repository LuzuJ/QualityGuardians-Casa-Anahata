export interface Paciente {
  id: string;
  nombre: string;
  correo: string;
  fechaNacimiento: string;
  genero?: string;
  observaciones?: string;
  instructorId: string; // Relación con el instructor autenticado
}
