import { loginInstructor, loginPaciente } from '../services/authService';
import { Request, Response } from 'express';

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { correo, contraseña, rol } = req.body;
    if (!correo || !contraseña || !rol) {
      return res.status(400).json({ error: 'Correo, contraseña y rol son obligatorios' });
    }

    let loginData;
    if (rol === 'instructor') {
      loginData = await loginInstructor(correo, contraseña);
    } else if (rol === 'paciente') {
      loginData = await loginPaciente(correo, contraseña);
    } else {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    res.json(loginData);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};