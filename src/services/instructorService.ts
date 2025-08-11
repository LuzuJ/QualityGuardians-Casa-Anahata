import { supabase } from '../config/supabaseClient';
import { Instructor } from '../models/instructor';
import { validarContraseña } from '../utils/validacion';
import bcrypt from 'bcrypt';

/**
 * Registra un nuevo instructor en el sistema
 * 
 * @param nombre - Nombre completo del instructor
 * @param correo - Email del instructor (debe ser único)
 * @param contraseña - Contraseña en texto plano del instructor
 * @returns Promise que resuelve con los datos del instructor registrado (sin contraseña)
 * @throws Error si la contraseña no es válida, el correo ya está registrado, o hay error en la base de datos
 */
export async function registrarInstructor(
  nombre: string,
  correo: string,
  contraseña: string
): Promise<Omit<Instructor, 'contraseña'>> {
  validarContraseña(contraseña);
  
  const { data: existente } = await supabase
    .from('Instructor') 
    .select('id')
    .eq('correo', correo) 
    .single(); 

  if (existente) {
    throw new Error('El correo ya está registrado');
  }

  const hash = await bcrypt.hash(contraseña, 10);
  const nuevoInstructor: Omit<Instructor, 'id'> = { 
    nombre,
    correo,
    contraseña: hash,
  };

  const { data, error } = await supabase
    .from('Instructor')
    .insert(nuevoInstructor)
    .select('id, nombre, correo') 
    .single();

  if (error) {
    console.error("Error en Supabase al registrar instructor:", error);
    throw new Error('Error al registrar al instructor.');
  }

  return data;
}
