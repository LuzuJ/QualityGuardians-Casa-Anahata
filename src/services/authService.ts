import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { instructores } from '../database/instructores';
import { pacientes } from '../database/pacientes';

// Definimos el tipo de objeto que vamos a devolver
interface LoginResponse {
  token: string;
  rol: 'instructor' | 'paciente';
}

export async function loginInstructor(correo: string, contraseña: string): Promise<LoginResponse> {
  const instructor = instructores.find(i => i.correo === correo);

  if (!instructor) {
    throw new Error('No existe una cuenta con este correo');
  }

  const match = await bcrypt.compare(contraseña, instructor.contraseña);
  if (!match) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    { id: instructor.id, correo: instructor.correo, rol: 'instructor' },
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '2h' }
  );

  // Devolvemos el objeto completo
  return { token, rol: 'instructor' };
}

export async function loginPaciente(correo: string, contraseña: string): Promise<LoginResponse> {
  const paciente = pacientes.find(p => p.correo === correo);

  if (!paciente || paciente.estado !== 'activo' || !paciente.contraseña) {
    throw new Error('Credenciales incorrectas o cuenta no activada.');
  }

  const match = await bcrypt.compare(contraseña, paciente.contraseña);
  if (!match) {
    throw new Error('Credenciales incorrectas.');
  }
  
  const token = jwt.sign({ id: paciente.id, correo: paciente.correo, rol: 'paciente' }, process.env.JWT_SECRET ?? 'secret', { expiresIn: '2h' });
  return { token, rol: 'paciente' };
}