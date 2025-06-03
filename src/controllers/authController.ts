import { RequestHandler } from 'express';
import { loginInstructor } from '../services/authService';

export const loginInstructorHandler: RequestHandler = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
      return;
    }

    const token = await loginInstructor(correo, contraseña);

    res.json({ token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
