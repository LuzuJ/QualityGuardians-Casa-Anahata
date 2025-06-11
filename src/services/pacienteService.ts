import { pacientes } from '../database/pacientes';
import { Paciente } from '../models/paciente';
import { series } from '../database/series';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { HistorialSesion } from '../models/historialSesion';

export async function registrarPaciente(data: Omit<Paciente, 'id' | 'contraseña' | 'estado' | 'historialSesiones' | 'serieAsignada'>): Promise<Paciente> {
  if (pacientes.find(p => p.correo === data.correo)) {
    throw new Error('El correo ya está registrado');
  }
  const nuevo: Paciente = {
    id: uuidv4(),
    ...data,
    estado: 'pendiente',
    historialSesiones: [],
  };
  pacientes.push(nuevo);
  return nuevo;
}

export async function actualizarPaciente(id: string, data: Partial<Omit<Paciente, 'id' | 'instructorId'>>): Promise<Paciente> {
  const index = pacientes.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Paciente no encontrado');
  pacientes[index] = { ...pacientes[index], ...data };
  return pacientes[index];
}

export async function obtenerPacientesPorInstructor(instructorId: string): Promise<Paciente[]> {
  return pacientes.filter(p => p.instructorId === instructorId);
}

export async function establecerPasswordPaciente(correo: string, nuevaContraseña: string): Promise<{ message: string }> {
  const pacienteIndex = pacientes.findIndex(p => p.correo === correo);
  if (pacienteIndex === -1) throw new Error("No se encontró un paciente con ese correo electrónico.");
  const paciente = pacientes[pacienteIndex];
  if (paciente.estado !== 'pendiente') throw new Error("Esta cuenta ya ha sido activada.");
  const hashContraseña = await bcrypt.hash(nuevaContraseña, 10);
  pacientes[pacienteIndex] = { ...paciente, contraseña: hashContraseña, estado: 'activo' };
  return { message: "Cuenta activada y contraseña establecida con éxito." };
}

export async function asignarSerieAPaciente(pacienteId: string, serieId: string): Promise<Paciente> {
  const pacienteIndex = pacientes.findIndex(p => p.id === pacienteId);
  if (pacienteIndex === -1) throw new Error('Paciente no encontrado');
  const serieAAsignar = series.find(s => s.id === serieId);
  if (!serieAAsignar) throw new Error('Serie no encontrada');
  pacientes[pacienteIndex].serieAsignada = {
    idSerie: serieAAsignar.id,
    nombreSerie: serieAAsignar.nombre,
    fechaAsignacion: new Date().toISOString(),
    sesionesRecomendadas: serieAAsignar.sesionesRecomendadas,
    sesionesCompletadas: 0,
  };
  return pacientes[pacienteIndex];
}

export async function obtenerSerieAsignada(pacienteId: string): Promise<any> {
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente || !paciente.serieAsignada) throw new Error('No tienes una serie terapéutica asignada.');
  return paciente.serieAsignada;
}

export async function registrarSesionCompletada(pacienteId: string, datosSesion: { dolorInicio: number, dolorFin: number, comentario: string }): Promise<{ message: string }> {
  const pacienteIndex = pacientes.findIndex(p => p.id === pacienteId);
  if (pacienteIndex === -1) throw new Error('Paciente no encontrado');
  const paciente = pacientes[pacienteIndex];
  if (!paciente.serieAsignada) throw new Error('No se puede registrar una sesión sin una serie asignada.');

  const nuevaSesion: HistorialSesion = {
    id: uuidv4(),
    pacienteId: paciente.id,
    serieId: paciente.serieAsignada.idSerie,
    fecha: new Date().toISOString(),
    ...datosSesion
  };
  paciente.historialSesiones.push(nuevaSesion);
  if (paciente.serieAsignada) paciente.serieAsignada.sesionesCompletadas++;
  pacientes[pacienteIndex] = paciente;
  return { message: 'Sesión registrada con éxito' };
}

export async function obtenerHistorialDePaciente(pacienteId: string): Promise<HistorialSesion[]> {
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) throw new Error('Paciente no encontrado');
  return paciente.historialSesiones || [];
}