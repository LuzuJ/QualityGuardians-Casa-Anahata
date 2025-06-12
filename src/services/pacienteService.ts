import { obtenerPosturaPorId } from './posturaService';
import { supabase } from '../config/supabaseClient';
import { Paciente } from '../models/paciente';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { HistorialSesion } from '../models/historialSesion';

type RegistrarPacienteData = Omit<Paciente, 'contrasena' | 'estado' | 'serieAsignada' | 'historialSesiones'>;

export async function registrarPaciente(datos: RegistrarPacienteData) {
  // 1. Verificar si el correo ya existe
  const { data: existentePorCorreo } = await supabase
    .from('Paciente')
    .select('cedula')
    .eq('correo', datos.correo)
    .single();

  if (existentePorCorreo) {
    throw new Error('El correo ya está registrado');
  }

  // 2. Verificar si la cédula ya existe
  const { data: existentePorCedula } = await supabase
    .from('Paciente')
    .select('cedula')
    .eq('cedula', datos.cedula)
    .single();

  if (existentePorCedula) {
    throw new Error('La cédula ya está registrada');
  }

  // 3. Preparar y registrar el nuevo paciente
  const nuevoPaciente = {
    ...datos,
    estado: 'pendiente',
    historialSesiones: [],
  };

  const { data, error } = await supabase
    .from('Paciente')
    .insert(nuevoPaciente)
    .select()
    .single();

  if (error) {
    // Es buena práctica mantener un log en el backend para errores críticos de base de datos.
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
  const { data, error } = await supabase.from('Paciente').select('*').eq('instructorId', instructorId);
  if (error) throw new Error('Error al obtener pacientes.');
  return data || [];
}

export async function establecerPasswordPaciente(correo: string, nuevaContraseña: string) {
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

export async function registrarSesionCompletada(pacienteId: string, datosSesion: { dolorInicio: number, dolorFin: number, comentario: string }) {
  const { data: paciente, error: findError } = await supabase.from('Paciente').select('cedula, serieAsignada, historialSesiones').eq('cedula', pacienteId).single();
  if (findError || !paciente) throw new Error('Paciente no encontrado');
  if (!paciente.serieAsignada) throw new Error('No se puede registrar una sesión sin una serie asignada.');

  const nuevaSesion: HistorialSesion = {
    id: uuidv4(),
    pacienteId: paciente.cedula,
    serieId: paciente.serieAsignada.idSerie,
    fecha: new Date().toISOString(),
    ...datosSesion
  };

  const historialActualizado = [...(paciente.historialSesiones || []), nuevaSesion];
  const serieActualizada = {
    ...paciente.serieAsignada,
    sesionesCompletadas: paciente.serieAsignada.sesionesCompletadas + 1
  };

  const { error: updateError } = await supabase.from('Paciente').update({
    historialSesiones: historialActualizado,
    serieAsignada: serieActualizada
  }).eq('cedula', pacienteId);

  if (updateError) throw new Error('Error al registrar la sesión.');
  return { message: 'Sesión registrada con éxito' };
}

export async function obtenerHistorialDePaciente(pacienteCedula: string) { 
  const { data, error } = await supabase.from('Paciente').select('historialSesiones').eq('cedula', pacienteCedula).single();
  if (error || !data) throw new Error('Paciente no encontrado.');
  return data.historialSesiones || [];
}
