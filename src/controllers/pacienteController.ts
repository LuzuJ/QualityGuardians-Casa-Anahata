import { Request, Response, RequestHandler } from 'express';
import { obtenerPacientesPorInstructor, registrarPaciente, actualizarPaciente, establecerPasswordPaciente } from '../services/pacienteService';

export const crearPacienteHandler: RequestHandler = async(req, res) => {
  try {
    const { nombre, correo, fechaNacimiento, genero, observaciones } = req.body;

    if (!nombre || !correo || !fechaNacimiento) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const instructorId = req.user?.id;

    if (!instructorId) {
      res.status(400).json({ error: 'Instructor no autenticado' });
      return;
    }

    const paciente = await registrarPaciente({
      nombre,
      correo,
      fechaNacimiento,
      genero,
      observaciones,
      instructorId,
      estado: 'pendiente'
    });
    res.status(201).json(paciente);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
  
export const actualizarPacienteHandler = async (req: Request, res: Response) => {
    try {
      const pacienteId = req.params.id;
      const { nombre, correo, fechaNacimiento, genero, observaciones } = req.body;

    const pacienteActualizado = await actualizarPaciente(pacienteId, {
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

export const listarPacientesHandler = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  if (!instructorId) {
    res.status(400).json({ error: 'Instructor no autenticado' });
    return;
  }
  const pacientes = await obtenerPacientesPorInstructor(instructorId);
  res.json(pacientes);
};

export const establecerPasswordPacienteHandler: RequestHandler = async (req, res) => {
  try {
    const { correo, nuevaContraseña } = req.body;

    if (!correo || !nuevaContraseña) {
      res.status(400).json({ error: 'El correo y la nueva contraseña son obligatorios.' });
      return;
    }

    const resultado = await establecerPasswordPaciente(correo, nuevaContraseña);

    res.status(200).json(resultado);

  } catch (error: any) {
    if (error.message.includes("No se encontró")) {
        res.status(404).json({ error: error.message });
        return;
    }
  }
};