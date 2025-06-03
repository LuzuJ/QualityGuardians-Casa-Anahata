import { Paciente } from '../models/paciente';
import { v4 as uuidv4 } from 'uuid';

const pacientes: Paciente[] = [];

export function crearPaciente(data: Omit<Paciente, 'id'>): Paciente {
  const existente = pacientes.find(p => p.correo === data.correo);
  if (existente) {
    throw new Error('Correo ya registrado');
  }

  const nuevo: Paciente = {
    id: uuidv4(),
    ...data
  };

  pacientes.push(nuevo);
  return nuevo;
}

export function obtenerTodos(): Paciente[] {
  return pacientes;
}
