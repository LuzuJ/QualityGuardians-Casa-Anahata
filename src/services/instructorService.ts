import { supabase } from '../config/supabaseClient';
import { Instructor } from '../models/instructor';
import bcrypt from 'bcrypt';


export async function registrarInstructor(
  nombre: string,
  correo: string,
  contraseña: string
): Promise<Omit<Instructor, 'contraseña'>> {
  const { data: existente } = await supabase
    .from('Instructor') // Usa el nombre EXACTO de tu tabla en Supabase
    .select('id')
    .eq('correo', correo) // eq() es como un 'WHERE correo = ...'
    .single(); // .single() espera un solo resultado o ninguno

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
    .select('id, nombre, correo') // Selecciona solo los campos seguros para devolver
    .single();

  if (error) {
    console.error("Error en Supabase al registrar instructor:", error);
    throw new Error('Error al registrar al instructor.');
  }

  return data;
}
