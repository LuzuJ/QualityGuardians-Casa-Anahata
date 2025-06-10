import { pacientes } from '../database/pacientes';
import { Paciente } from '../models/paciente';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function registrarPaciente(data: Omit<Paciente, 'id'>): Promise<Paciente> {
  const existe = pacientes.find(p => p.correo === data.correo);
  if (existe) {
    throw new Error('El correo ya está registrado');
  }

  const nuevo: Paciente = {
    id: uuidv4(),
    ...data,
    estado: 'pendiente'
  };

  pacientes.push(nuevo);
  return nuevo;
}

export async function actualizarPaciente(id: string, data: Partial<Omit<Paciente, 'id' | 'instructorId'>>): Promise<Paciente> {
  const index = pacientes.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Paciente no encontrado');
  }

  // Validación simple: correo con "@"
  if (data.correo && !data.correo.includes('@')) {
    throw new Error('Correo inválido');
  }

  pacientes[index] = {
    ...pacientes[index],
    ...data
  };

  return pacientes[index];
}

export async function obtenerPacientesPorInstructor(instructorId: string) {
  return pacientes.filter(p => p.instructorId === instructorId);
}

export async function establecerPasswordPaciente(correo: string, nuevaContraseña: string): Promise<{ message: string }> {
  // 1. Buscar al paciente por su correo
  const pacienteIndex = pacientes.findIndex(p => p.correo === correo);
  
  if (pacienteIndex === -1) {
    throw new Error("No se encontró un paciente con ese correo electrónico.");
  }

  const paciente = pacientes[pacienteIndex];

  // 2. Verificar que la cuenta esté pendiente
  if (paciente.estado !== 'pendiente') {
    throw new Error("Esta cuenta ya ha sido activada anteriormente.");
  }

  // 3. Hashear la nueva contraseña
  const saltRounds = 10;
  const hashContraseña = await bcrypt.hash(nuevaContraseña, saltRounds);

  // 4. Actualizar el registro del paciente en el array
  pacientes[pacienteIndex] = {
    ...paciente,
    contraseña: hashContraseña,
    estado: 'activo'
  };

  return { message: "Cuenta activada y contraseña establecida con éxito." };
}

