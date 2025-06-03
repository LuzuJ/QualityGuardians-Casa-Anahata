import { Instructor } from '../models/instructor';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Simulación de base de datos en memoria
const instructores: Instructor[] = [];

export async function registrarInstructor(
  nombre: string,
  correo: string,
  contraseña: string
): Promise<Omit<Instructor, 'contraseña'>> {
  const existente = instructores.find(i => i.correo === correo);
  if (existente) {
    throw new Error('El correo ya está registrado');
  }

  const hash = await bcrypt.hash(contraseña, 10);
  const nuevo: Instructor = {
    id: uuidv4(),
    nombre,
    correo,
    contraseña: hash,
  };

  instructores.push(nuevo);

  // Retornar sin la contraseña
  const { contraseña: _, ...sinContraseña } = nuevo;
  return sinContraseña;
}
