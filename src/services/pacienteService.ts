import { pacientes } from '../database/pacientes';
import { Paciente } from '../models/paciente';
import { v4 as uuidv4 } from 'uuid';

export function registrarPaciente(data: Omit<Paciente, 'id'>): Paciente {
  const existe = pacientes.find(p => p.correo === data.correo);
  if (existe) {
    throw new Error('El correo ya está registrado');
  }

  const nuevo: Paciente = {
    id: uuidv4(),
    ...data
  };

  pacientes.push(nuevo);
  return nuevo;
}

export function actualizarPaciente(id: string, data: Partial<Omit<Paciente, 'id' | 'instructorId'>>): Paciente {
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

export function obtenerPacientesPorInstructor(instructorId: string) {
  return pacientes.filter(p => p.instructorId === instructorId);
}

