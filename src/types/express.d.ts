import { Instructor } from '../models/instructor';

interface JwtPayload {
  id: string;
  correo: string;
  rol: 'instructor' | 'paciente';
}

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}