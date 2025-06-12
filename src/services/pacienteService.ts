import { supabase } from '../config/supabaseClient';
import { Paciente } from '../models/paciente';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { HistorialSesion } from '../models/historialSesion';

export async function registrarPaciente(datos: any) { // Usamos 'any' temporalmente para facilitar la depuración
  console.log('--- PASO 1: Ingresando a registrarPaciente ---');
  console.log('Datos recibidos del controlador:', datos);

  try {
    // Verificación de correo
    const { data: existente } = await supabase.from('Paciente').select('cedula').eq('correo', datos.correo).single();
    if (existente) {
      console.error('Error: El correo ya existe.');
      throw new Error('El correo ya está registrado');
    }

    // Verificación de cédula
    const { data: cedulaExistente } = await supabase.from('Paciente').select('cedula').eq('cedula', datos.cedula).single();
    if (cedulaExistente) {
      console.error('Error: La cédula ya existe.');
      throw new Error('La cédula ya está registrada');
    }

    // --- Creamos el objeto manualmente para asegurar que los campos son correctos ---
    const nuevoPaciente = {
      cedula: datos.cedula,
      nombre: datos.nombre,
      correo: datos.correo,
      telefono: datos.telefono,
      fechaNacimiento: datos.fechaNacimiento,
      instructorId: datos.instructorId,
      // ---- Campos que no vienen del formulario pero son necesarios ----
      estado: 'pendiente',
      historialSesiones: []
      // No incluimos 'genero' u 'observaciones' porque el formulario no los envía.
      // Si fueran obligatorios (NOT NULL) en la BD, la inserción fallaría.
    };
    
    console.log('--- PASO 2: Objeto listo para insertar ---');
    console.log(nuevoPaciente);

    const { data, error } = await supabase.from('Paciente').insert(nuevoPaciente).select().single();

    // Este bloque es el más importante. Si hay un error de BD, se mostrará aquí.
    if (error) {
      console.error('--- ¡ERROR DE SUPABASE AL INSERTAR! ---');
      console.error(error);
      throw new Error('Error de la base de datos al intentar registrar al paciente.');
    }

    console.log('--- PASO 3: Paciente registrado con éxito en la BD ---');
    return data;

  } catch (err: any) {
    // Este bloque capturará cualquier error que lancemos arriba (correo/cédula duplicada)
    console.error('--- Error final capturado por el servicio ---');
    console.error(err.message);
    throw err; // Re-lanzamos el error para que el controlador envíe el 400
  }
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

export async function obtenerSerieAsignada(pacienteId: string) { 
  const { data, error } = await supabase.from('Paciente').select('serieAsignada').eq('id', pacienteId).single();
  if (error || !data || !data.serieAsignada) throw new Error('No tienes una serie terapéutica asignada.');
  return data.serieAsignada;
}

export async function registrarSesionCompletada(pacienteId: string, datosSesion: { dolorInicio: number, dolorFin: number, comentario: string }) {
  const { data: paciente, error: findError } = await supabase.from('Paciente').select('id, serieAsignada, historialSesiones').eq('id', pacienteId).single();
  if (findError || !paciente) throw new Error('Paciente no encontrado');
  if (!paciente.serieAsignada) throw new Error('No se puede registrar una sesión sin una serie asignada.');

  const nuevaSesion: HistorialSesion = {
    id: uuidv4(),
    pacienteId: paciente.id,
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
  }).eq('id', pacienteId);

  if (updateError) throw new Error('Error al registrar la sesión.');
  return { message: 'Sesión registrada con éxito' };
}

export async function obtenerHistorialDePaciente(pacienteCedula: string) { 
  const { data, error } = await supabase.from('Paciente').select('historialSesiones').eq('cedula', pacienteCedula).single();
  if (error || !data) throw new Error('Paciente no encontrado.');
  return data.historialSesiones || [];
}
