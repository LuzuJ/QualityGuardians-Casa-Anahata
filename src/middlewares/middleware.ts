import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express';

export function verificarInstructor(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token no enviado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Formato de token incorrecto' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');

    req.user = decoded as JwtPayload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}
