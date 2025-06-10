export interface Paciente {
  id: string;
  nombre: string;
  correo: string;
  contraseña?: string; 
  estado: 'pendiente' | 'activo'; 
  fechaNacimiento: string;
  genero?: string;
  observaciones?: string;
  instructorId: string;
}