import { obtenerPosturaPorId } from './posturaService';
import { supabase } from '../config/supabaseClient';
import { Paciente } from '../models/paciente';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Sesion } from '../models/Sesion';

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

type RegistrarPacienteData = Omit<Paciente, 'contrasena' | 'estado' | 'serieAsignada' | 'historialSesiones'>;

export async function registrarPaciente(datosPaciente: Omit<Paciente, 'contrasena' | 'estado' | 'serieAsignada' | 'instructorId'>, instructorId: string) {
  
  // 1. Verificar si el correo o la cédula ya existen (lógica existente)
  const { data: existentePorCorreo } = await supabase
    .from('Paciente')
    .select('cedula')
    .eq('correo', datosPaciente.correo)
    .single();

  if (existentePorCorreo) {
    throw new Error('El correo ya está registrado');
  }

  const { data: existentePorCedula } = await supabase
    .from('Paciente')
    .select('cedula')
    .eq('cedula', datosPaciente.cedula)
    .single();

  if (existentePorCedula) {
    throw new Error('La cédula ya está registrada');
  }

  // 2. Preparar el nuevo objeto del paciente
  const nuevoPaciente = {
    ...datosPaciente,
    instructorId: instructorId, // <-- Aquí se asigna el ID del instructor
    estado: 'pendiente' as const,
  };

  // 3. Insertar en la base de datos
  const { data, error } = await supabase
    .from('Paciente')
    .insert(nuevoPaciente)
    .select()
    .single();

  if (error) {
    console.error('Error de Supabase al insertar paciente:', error); 
    throw new Error('Error al registrar al paciente.');
  }

  return data;
}

export async function actualizarPaciente(cedula: string, datos: Partial<Omit<Paciente, 'id' | 'instructorId'>>) {
  const { data, error } = await supabase.from('Paciente').update(datos).eq('cedula', cedula).select().single();
  if (error) throw new Error('Error al actualizar o paciente no encontrado.');
  return data;
}

export async function obtenerPacientesPorInstructor(instructorId: string): Promise<Paciente[]> {
  
  // En lugar de select('*'), especificamos las columnas que necesitamos.
  // Esto evita problemas si una columna no utilizada (como serieAsignada) tiene datos corruptos.
  const { data, error } = await supabase
    .from('Paciente')
    .select('cedula, nombre, correo, fechaNacimiento, telefono, observaciones, genero') // <-- CONSULTA ESPECÍFICA
    .eq('instructorId', instructorId);

  if (error) {
    console.error("Error al obtener la lista de pacientes:", error);
    throw new Error('Error de base de datos al obtener los pacientes.');
  }

  return (data || []).map((p: any) => ({
    ...p,
    estado: p.estado ?? 'pendiente',
    instructorId: p.instructorId ?? instructorId,
    serieAsignada: p.serieAsignada ?? null,
    historialSesiones: p.historialSesiones ?? [],
    contrasena: p.contrasena ?? '',
  })) as Paciente[];
}

export async function establecerPasswordPaciente(correo: string, nuevaContraseña: string) {
  validarContraseña(nuevaContraseña);

  const { data: paciente, error: findError } = await supabase.from('Paciente').select('*').eq('correo', correo).single();
  if (findError || !paciente) throw new Error("No se encontró un paciente con ese correo electrónico.");
  if (paciente.estado !== 'pendiente') throw new Error("Esta cuenta ya ha sido activada.");
  
  const hashContraseña = await bcrypt.hash(nuevaContraseña, 10);
  
  const { error: updateError } = await supabase.from('Paciente').update({ contraseña: hashContraseña, estado: 'activo' }).eq('correo', correo);
  if (updateError) throw new Error('Error al activar la cuenta.');
  
  return { message: "Cuenta activada y contraseña establecida con éxito." };
}

export async function asignarSerieAPaciente(pacienteCedula: string, serieId: string) {
  const { data: serieAAsignar } = await supabase.from('Series').select('*').eq('id', serieId).single();
  if (!serieAAsignar) throw new Error('Serie no encontrada');

  const datosAsignacion = {
    idSerie: serieAAsignar.id,
    nombreSerie: serieAAsignar.nombre,
    fechaAsignacion: new Date().toISOString(),
    sesionesRecomendadas: serieAAsignar.sesionesRecomendadas,
    sesionesCompletadas: 0,
  };
  
  const { data, error } = await supabase.from('Paciente').update({ serieAsignada: datosAsignacion }).eq('cedula', pacienteCedula).select().single();
  if (error) throw new Error('Error al asignar la serie o paciente no encontrado.');
  return data;
}

export async function obtenerSerieAsignada(pacienteCedula: string) { 
  // 1. Obtener la información de la asignación desde la tabla Paciente
  const { data: paciente, error: errorPaciente } = await supabase
    .from('Paciente')
    .select('serieAsignada')
    .eq('cedula', pacienteCedula)
    .single();
    
  if (errorPaciente || !paciente || !paciente.serieAsignada) {
    throw new Error('No tienes una serie terapéutica asignada.');
  }

  const idSerieAsignada = paciente.serieAsignada.idSerie;

  // 2. Usar ese ID para buscar la serie (aún con datos incompletos de posturas)
  const { data: serieIncompleta, error: errorSerie } = await supabase
    .from('Series')
    .select('*')
    .eq('id', idSerieAsignada)
    .single();

  if (errorSerie || !serieIncompleta) {
      throw new Error('La serie asignada ya no existe o no pudo ser encontrada.');
  }

  // 3. --- ¡LA PARTE NUEVA E IMPORTANTE! ---
  // "Enriquecemos" la lista de posturas con sus detalles completos
  const posturasEnriquecidas = await Promise.all(
    (serieIncompleta.posturas || []).map(async (p: { idPostura: string, duracionMinutos: number }) => {
        // Por cada postura, usamos su ID para buscar todos sus detalles
        const detallesPostura = await obtenerPosturaPorId(p.idPostura);
        
        // Devolvemos un nuevo objeto que combina los detalles completos + la duración de esta serie
        return {
            ...detallesPostura,
            duracionMinutos: p.duracionMinutos
        };
    })
  );

  // 4. Preparamos el objeto final para el frontend, con la lista de posturas ya completa
  const serieParaFrontend = {
      ...serieIncompleta,
      secuencia: posturasEnriquecidas, // Renombramos a 'secuencia' como lo espera el frontend
  };
  // @ts-ignore
  delete serieParaFrontend.posturas; // Eliminamos la propiedad original para evitar redundancia

  return serieParaFrontend;
}

export async function registrarSesionCompletada(pacienteId: string, datosSesion: Omit<Sesion, 'id' | 'pacienteId' | 'serieId' | 'fecha'>) {
    const { data: paciente, error: findError } = await supabase
      .from('Paciente')
      .select('cedula, serieAsignada')
      .eq('cedula', pacienteId)
      .single();

    if (findError || !paciente) throw new Error('Paciente no encontrado');
    if (!paciente.serieAsignada?.idSerie) throw new Error('No se puede registrar una sesión sin una serie asignada.');

    const nuevaSesionParaInsertar = {
      id: uuidv4(),
      pacienteId: paciente.cedula,
      serieId: paciente.serieAsignada.idSerie,
      fecha: new Date().toISOString(),
      ...datosSesion
    };

    const { error: insertError } = await supabase
        .from('Sesiones')
        .insert(nuevaSesionParaInsertar);

    if (insertError) {
        console.error("Error al registrar la sesión:", insertError);
        throw new Error('Error al guardar el registro de la sesión.');
    }

    const serieActualizada = {
      ...paciente.serieAsignada,
      sesionesCompletadas: (paciente.serieAsignada.sesionesCompletadas || 0) + 1
    };
  
    await supabase.from('Paciente').update({
      serieAsignada: serieActualizada
    }).eq('cedula', pacienteId);
  
    return { message: 'Sesión registrada con éxito' };
}

export async function obtenerHistorialDePaciente(pacienteCedula: string): Promise<Sesion[]> { 
    const { data, error } = await supabase
        .from('Sesiones')
        .select('*')
        .eq('pacienteId', pacienteCedula)
        .order('fecha', { ascending: false });

    if (error) {
        console.error("Error al obtener historial:", error);
        throw new Error('No se pudo obtener el historial del paciente.');
    }

    return data || [];
}

export async function obtenerPacientePorCedula(cedula: string): Promise<Paciente> {
  const { data, error } = await supabase
    .from('Paciente')
    .select('cedula, nombre, correo, fechaNacimiento, telefono, genero, observaciones, serieAsignada, estado, instructorId, contrasena, historialSesiones')
    .eq('cedula', cedula)
    .single();

  if (error) {
    console.error("Error al obtener paciente por cédula:", error);
    throw new Error('Paciente no encontrado.');
  }
  // Aseguramos que los campos requeridos por el tipo Paciente estén presentes
  return {
    ...data,
    estado: data.estado ?? 'pendiente',
    instructorId: data.instructorId ?? '',
    contrasena: data.contrasena ?? '',
    historialSesiones: data.historialSesiones ?? [],
  } as Paciente;
}
