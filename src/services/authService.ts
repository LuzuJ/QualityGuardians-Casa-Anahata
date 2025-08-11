import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient';
import { JWT_SECRET } from '../config/env';

/**
 * Respuesta del login que incluye el token JWT y el rol del usuario
 */
interface LoginResponse {
  token: string;
  rol: 'instructor' | 'paciente';
}

/**
 * Autentica a un instructor con sus credenciales
 * 
 * @param correo - Email del instructor
 * @param contraseña - Contraseña en texto plano del instructor
 * @returns Promise que resuelve con el token JWT y rol del instructor
 * @throws Error si las credenciales son incorrectas o el instructor no existe
 */
export async function loginInstructor(correo: string, contraseña: string): Promise<LoginResponse> {
  const { data, error } = await supabase
    .from('Instructor')
    .select('id, contraseña')
    .eq('correo', correo)
    .single();

  const instructor = data as { id: string; contraseña: string } | null;

  if (error || !instructor) {
    throw new Error('Credenciales incorrectas.');
  }

  const match = await bcrypt.compare(contraseña, instructor.contraseña);
  if (!match) {
    throw new Error('Credenciales incorrectas.');
  }

  const token = jwt.sign(
    { id: instructor.id, correo: correo, rol: 'instructor' },
    JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  return { token, rol: 'instructor' };
}

/**
 * Autentica a un paciente con sus credenciales
 * 
 * @param correo - Email del paciente
 * @param contraseña - Contraseña en texto plano del paciente
 * @returns Promise que resuelve con el token JWT y rol del paciente
 * @throws Error si las credenciales son incorrectas, el paciente no existe, 
 *         la cuenta no está activada o no tiene contraseña
 */
export async function loginPaciente(correo: string, contraseña: string): Promise<LoginResponse> {
  const { data, error } = await supabase
    .from('Paciente')
    .select('cedula, contraseña, estado')
    .eq('correo', correo)
    .single();
  
  const paciente = data as { cedula: string; contraseña: string; estado: string } | null;

  if (error || !paciente || paciente.estado !== 'activo' || !paciente.contraseña) {
    throw new Error('Credenciales incorrectas o cuenta no activada.');
  }

  const match = await bcrypt.compare(contraseña, paciente.contraseña);
  if (!match) {
    throw new Error('Credenciales incorrectas.');
  }
  
  const token = jwt.sign(
    { id: paciente.cedula, correo: correo, rol: 'paciente' },
    JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  return { token, rol: 'paciente' };
}