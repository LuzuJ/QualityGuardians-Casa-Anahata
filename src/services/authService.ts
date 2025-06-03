import { Instructor } from '../models/instructor';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { instructores } from '../database/instructores';



// Función para login
export async function loginInstructor(correo: string, contraseña: string): Promise<string> {
  const instructor = instructores.find(i => i.correo === correo);

  if (!instructor) {
    throw new Error('No existe una cuenta con este correo');
  }

  const match = await bcrypt.compare(contraseña, instructor.contraseña);
  if (!match) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    { id: instructor.id, correo: instructor.correo },
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '2h' }
  );

  return token;
}
