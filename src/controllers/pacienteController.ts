import { Request, Response } from 'express';
import { crearPaciente } from '../services/pacienteService';

export function crearPacienteHandler(req: Request, res: Response) {
  try {
    const instructorId = (req as any).user.id;
    const paciente = crearPaciente({ ...req.body, instructorId });
    res.status(201).json(paciente);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
