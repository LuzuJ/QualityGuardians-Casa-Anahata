import { Instructor } from '../models/instructor';

// Este es el tipo de dato que realmente contiene tu token JWT
interface JwtPayload {
  id: string;
  correo: string;
}

declare global {
  namespace Express {
    export interface Request {
      // Usamos el tipo del payload del JWT aquí.
      user?: JwtPayload;
    }
  }
}