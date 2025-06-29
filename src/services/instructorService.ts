import { supabase } from '../config/supabaseClient';
import { Instructor } from '../models/instructor';
import bcrypt from 'bcrypt';

const validarContraseña = (contraseña: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(contraseña);
  const hasLowerCase = /[a-z]/.test(contraseña);
  const hasNumbers = /\d/.test(contraseña);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(contraseña);

  if (contraseña.length < minLength) throw new Error(`La contraseña debe tener al menos ${minLength} caracteres.`);
  if (!hasUpperCase) throw new Error("La contraseña debe contener al menos una letra mayúscula.");
  if (!hasLowerCase) throw new Error("La contraseña debe contener al menos una letra minúscula.");
  if (!hasNumbers) throw new Error("La contraseña debe contener al menos un número.");
  if (!hasSpecialChar) throw new Error("La contraseña debe contener al menos un carácter especial.");
};

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
