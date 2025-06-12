import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient';

// Definimos el tipo de objeto que vamos a devolver
interface LoginResponse {
  token: string;
  rol: 'instructor' | 'paciente';
}

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
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '8h' }
  );

  return { token, rol: 'instructor' };
}

export async function loginPaciente(correo: string, contraseña: string): Promise<LoginResponse> {
  const { data, error } = await supabase
    .from('Paciente')
    .select('cedula, contraseña, estado')
    .eq('correo', correo)
    .single();
  
  // CORRECCIÓN: Actualizamos el tipo para que espere 'id'.
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
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '8h' }
  );

  return { token, rol: 'paciente' };
}