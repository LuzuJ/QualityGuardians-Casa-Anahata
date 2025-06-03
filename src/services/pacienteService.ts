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
