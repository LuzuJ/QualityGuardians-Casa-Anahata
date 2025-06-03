import { RequestHandler } from 'express';
import { registrarPaciente } from '../services/pacienteService';

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
