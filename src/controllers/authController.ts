import { RequestHandler } from 'express';
import { loginInstructor, loginPaciente } from '../services/authService';

export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { correo, contraseña, rol } = req.body;

    if (!correo || !contraseña || !rol) {
      res.status(400).json({ error: 'Correo, contraseña y rol son obligatorios' });
      return;
    }

    let loginData;

    if (rol === 'instructor') {
      loginData = await loginInstructor(correo, contraseña);
    } else if (rol === 'paciente') {
      loginData = await loginPaciente(correo, contraseña);
    } else {
      res.status(400).json({ error: 'Rol no válido' });
      return;
    }

    res.json(loginData);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
