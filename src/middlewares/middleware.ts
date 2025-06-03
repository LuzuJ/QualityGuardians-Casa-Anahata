import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function verificarInstructor(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no enviado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // @ts-ignore
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
