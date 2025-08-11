import { loginInstructor, loginPaciente } from '../services/authService';
import { Request, Response } from 'express';

/**
 * Maneja el proceso de autenticación para instructores y pacientes
 * 
 * @param req - Objeto Request de Express que debe contener en el body:
 *   - correo: Email del usuario
 *   - contraseña: Contraseña en texto plano
 *   - rol: Tipo de usuario ('instructor' | 'paciente')
 * @param res - Objeto Response de Express para enviar la respuesta
 * 
 * @returns Responde con:
 *   - 200: Token JWT y rol del usuario autenticado
 *   - 400: Error de validación (datos faltantes o rol inválido)
 *   - 401: Error de autenticación (credenciales incorrectas)
 * 
 * @description
 * Valida los datos de entrada y delega la autenticación al servicio correspondiente
 * según el rol del usuario. Maneja errores de forma unificada.
 */
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