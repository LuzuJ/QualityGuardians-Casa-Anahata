import { Request, Response } from 'express';
import { registrarInstructor } from '../services/instructorService';

/**
 * Controlador para registrar un nuevo instructor en el sistema
 * 
 * @param req - Objeto Request de Express que debe contener en el body:
 *   - nombre: Nombre completo del instructor
 *   - correo: Email del instructor (debe ser único)
 *   - contraseña: Contraseña en texto plano del instructor
 * @param res - Objeto Response de Express para enviar la respuesta
 * 
 * @returns Responde con:
 *   - 201: Datos del instructor registrado exitosamente (sin contraseña)
 *   - 400: Error de validación (datos faltantes, correo duplicado, contraseña inválida)
 * 
 * @description
 * Valida que todos los campos requeridos estén presentes y delega el registro
 * al servicio correspondiente. La contraseña se hashea automáticamente en el servicio.
 */
export const registrarInstructorHandler = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contraseña } = req.body;
    
    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." });
    }

    const nuevoInstructor = await registrarInstructor(nombre, correo, contraseña);
    res.status(201).json(nuevoInstructor);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};