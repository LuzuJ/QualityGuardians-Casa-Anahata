import { RequestHandler } from 'express';
import { registrarInstructor } from '../services/instructorService';

export const registrarInstructorHandler: RequestHandler = async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;
    
    // Verificación de que los datos llegan
    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." });
    }

    const nuevoInstructor = await registrarInstructor(nombre, correo, contraseña);
    res.status(201).json(nuevoInstructor);
  } catch (error: any) {
    // Devuelve el mensaje de error específico
    res.status(400).json({ error: error.message });
  }
};