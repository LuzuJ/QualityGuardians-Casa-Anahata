import { Request, Response } from 'express';
import { registrarInstructor } from '../services/instructorService';

export async function registrarInstructorHandler(req: Request, res: Response) {
  try {
    const { nombre, correo, contraseña } = req.body;
    
    const nuevoInstructor = await registrarInstructor(nombre, correo, contraseña);
    res.status(201).json(nuevoInstructor);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
