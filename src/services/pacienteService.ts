import { obtenerPosturaPorId } from './posturaService';
import { supabase } from '../config/supabaseClient';
import { Paciente } from '../models/paciente';
import { validarContraseña } from '../utils/validacion';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Sesion } from '../models/sesion';

/**
 * Registra un nuevo paciente en el sistema
 * 
 * @param datosPaciente - Datos del paciente (excluyendo cedula, contraseña, estado y serieAsignada)
 * @param instructorId - ID del instructor que registra al paciente
 * @returns Promise que resuelve con los datos del paciente registrado
 * @throws Error si el correo o cédula ya están registrados, o hay error en la base de datos
 */
export async function registrarPaciente(datosPaciente: Omit<Paciente, 'cedula' | 'contraseña' | 'estado' | 'serieAsignada'>, instructorId: string) {
    const { data: existentePorCorreo } = await supabase
        .from('Paciente')
        .select('cedula')
        .eq('correo', (datosPaciente as any).correo)
        .single();
    if (existentePorCorreo) throw new Error('El correo ya está registrado');

    const { data: existentePorCedula } = await supabase
        .from('Paciente')
        .select('cedula')
        .eq('cedula', (datosPaciente as any).cedula)
        .single();
    if (existentePorCedula) throw new Error('La cédula ya está registrada');

    const nuevoPaciente = {
        ...(datosPaciente as any),
        instructorId: instructorId,
        estado: 'pendiente' as const,
    };

    const { data, error } = await supabase.from('Paciente').insert(nuevoPaciente).select().single();
    if (error) {
        console.error('Error de Supabase al insertar paciente:', error); 
        throw new Error('Error al registrar al paciente.');
    }
    return data;
}

/**
 * Actualiza los datos de un paciente existente
 * 
 * @param cedula - Cédula del paciente a actualizar
 * @param datos - Datos parciales a actualizar (excluyendo cedula e instructorId)
 * @returns Promise que resuelve con los datos actualizados del paciente
 * @throws Error si hay error al actualizar o el paciente no existe
 */
export async function actualizarPaciente(cedula: string, datos: Partial<Omit<Paciente, 'cedula' | 'instructorId'>>) {
    const { data, error } = await supabase.from('Paciente').update(datos).eq('cedula', cedula).select().single();
    if (error) throw new Error('Error al actualizar o paciente no encontrado.');
    return data;
}

/**
 * Obtiene la lista de pacientes asignados a un instructor específico
 * 
 * @param instructorId - ID del instructor
 * @returns Promise que resuelve con un array de pacientes (datos parciales)
 * @throws Error si hay error en la base de datos al obtener los pacientes
 */
export async function obtenerPacientesPorInstructor(instructorId: string): Promise<Partial<Paciente>[]> {
    const { data, error } = await supabase
        .from('Paciente')
        .select('cedula, nombre, correo, fechaNacimiento, telefono, genero, observaciones')
        .eq('instructorId', instructorId);

    if (error) {
        console.error("Error al obtener la lista de pacientes:", error);
        throw new Error('Error de base de datos al obtener los pacientes.');
    }
    return data || [];
}

/**
 * Establece la contraseña de un paciente y activa su cuenta
 * 
 * @param correo - Email del paciente
 * @param nuevaContraseña - Contraseña en texto plano a establecer
 * @returns Promise que resuelve con mensaje de confirmación
 * @throws Error si el paciente no existe, la cuenta ya está activada, la contraseña no es válida, o hay error al actualizar
 */
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

/**
 * Asigna una serie terapéutica a un paciente específico
 * 
 * @param pacienteCedula - Cédula del paciente
 * @param serieId - ID de la serie a asignar
 * @returns Promise que resuelve con los datos actualizados del paciente
 * @throws Error si la serie no existe o hay error al asignar
 */
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

/**
 * Obtiene la serie terapéutica asignada a un paciente con detalles de las posturas
 * 
 * @param pacienteCedula - Cédula del paciente
 * @returns Promise que resuelve con los datos completos de la serie asignada
 * @throws Error si el paciente no tiene serie asignada o la serie no existe
 */
export async function obtenerSerieAsignada(pacienteCedula: string) { 
    const { data: paciente, error: errorPaciente } = await supabase.from('Paciente').select('serieAsignada').eq('cedula', pacienteCedula).single();
    if (errorPaciente || !paciente?.serieAsignada ) {
        throw new Error('No tienes una serie terapéutica asignada.');
    }
    const idSerieAsignada = paciente.serieAsignada.idSerie;
    const { data: serieIncompleta, error: errorSerie } = await supabase.from('Series').select('*').eq('id', idSerieAsignada).single();
    if (errorSerie || !serieIncompleta) {
        throw new Error('La serie asignada ya no existe o no pudo ser encontrada.');
    }
    const posturasEnriquecidas = await Promise.all(
        (serieIncompleta.posturas ?? []).map(async (p: { idPostura: string, duracionMinutos: number }) => {
            const detallesPostura = await obtenerPosturaPorId(p.idPostura);
            return { ...detallesPostura, duracionMinutos: p.duracionMinutos };
        })
    );
    const serieParaFrontend = { ...serieIncompleta, secuencia: posturasEnriquecidas };
    delete serieParaFrontend.posturas;
    return serieParaFrontend;
}

/**
 * Registra una sesión completada por un paciente y actualiza el contador de sesiones
 * 
 * @param pacienteId - Cédula del paciente
 * @param datosSesion - Datos de la sesión (excluyendo id, pacienteId, seriesId y fecha)
 * @returns Promise que resuelve con mensaje de confirmación
 * @throws Error si el paciente no existe, no tiene serie asignada, o hay error al guardar
 */
export async function registrarSesionCompletada(pacienteId: string, datosSesion: Omit<Sesion, 'id' | 'pacienteId' | 'seriesId' | 'fecha'>) {
    const { data: paciente, error: findError } = await supabase.from('Paciente').select('cedula, serieAsignada').eq('cedula', pacienteId).single();
    if (findError || !paciente) throw new Error('Paciente no encontrado');
    if (!paciente.serieAsignada?.idSerie) throw new Error('No se puede registrar una sesión sin una serie asignada.');

    const nuevaSesionParaInsertar = {
        id: uuidv4(),
        pacienteId: paciente.cedula,
        seriesId: paciente.serieAsignada.idSerie,
        fecha: new Date().toISOString(),
        dolorInicial: datosSesion.dolorInicial,
        dolorFinal: datosSesion.dolorFinal,
        comentario: datosSesion.comentario,
        hora_inicio: datosSesion.hora_inicio,
        hora_fin: datosSesion.hora_fin,
        tiempo_efectivo_minutos: datosSesion.tiempo_efectivo_minutos,
        pausas: datosSesion.pausas
    };
    const { error: insertError } = await supabase.from('Sesiones').insert(nuevaSesionParaInsertar);
    if (insertError) {
        console.error("Error al registrar la sesión en la base de datos:", insertError);
        throw new Error('Error al guardar el registro de la sesión.');
    }
    const serieActualizada = {
        ...paciente.serieAsignada,
        sesionesCompletadas: (paciente.serieAsignada.sesionesCompletadas ?? 0) + 1
    };
    await supabase.from('Paciente').update({ serieAsignada: serieActualizada }).eq('cedula', pacienteId);
    return { message: 'Sesión registrada con éxito' };
}

/**
 * Obtiene el historial completo de sesiones de un paciente
 * 
 * @param pacienteCedula - Cédula del paciente
 * @returns Promise que resuelve con un array de sesiones ordenadas por fecha descendente
 * @throws Error si hay error al obtener el historial de la base de datos
 */
export async function obtenerHistorialDePaciente(pacienteCedula: string): Promise<Sesion[]> { 
    const { data, error } = await supabase.from('Sesiones').select('*').eq('pacienteId', pacienteCedula).order('fecha', { ascending: false });
    if (error) {
        console.error("Error al obtener historial:", error);
        throw new Error('No se pudo obtener el historial del paciente.');
    }
    return data || [];
}

/**
 * Obtiene los datos completos de un paciente por su cédula
 * 
 * @param cedula - Cédula del paciente
 * @returns Promise que resuelve con los datos completos del paciente
 * @throws Error si el paciente no existe o hay error en la base de datos
 */
export async function obtenerPacientePorCedula(cedula: string): Promise<Paciente> {
    const { data, error } = await supabase
        .from('Paciente')
        .select('cedula, nombre, correo, fechaNacimiento, telefono, genero, observaciones, serieAsignada, estado')
        .eq('cedula', cedula)
        .single();

    if (error || !data) {
        console.error("Error al obtener paciente por cédula:", error);
        throw new Error('Paciente no encontrado.');
    }
    return data as Paciente;
}