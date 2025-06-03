import { Request, Response, RequestHandler } from 'express';
import { obtenerPacientesPorInstructor, registrarPaciente } from '../services/pacienteService';
import { actualizarPaciente } from '../services/pacienteService';

export const crearPacienteHandler: RequestHandler = (req, res) => {
  try {
    const { nombre, correo, fechaNacimiento, genero, observaciones } = req.body;

    if (!nombre || !correo || !fechaNacimiento) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const instructorId = (req as any).user?.id;

    const paciente = registrarPaciente({
      nombre,
      correo,
      fechaNacimiento,
      genero,
      observaciones,
      instructorId
    });
    res.status(201).json(paciente);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
  };
  
  export const actualizarPacienteHandler = (req: Request, res: Response) => {
    try {
      const pacienteId = req.params.id;
      const { nombre, correo, fechaNacimiento, genero, observaciones } = req.body;

    const pacienteActualizado = actualizarPaciente(pacienteId, {
      nombre,
      correo,
      fechaNacimiento,
      genero,
      observaciones
    });

    res.json({ mensaje: 'Paciente actualizado correctamente', paciente: pacienteActualizado });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listarPacientesHandler = (req: Request, res: Response) => {
  const instructorId = (req as any).user?.id;
  const pacientes = obtenerPacientesPorInstructor(instructorId);
  res.json(pacientes);
};
