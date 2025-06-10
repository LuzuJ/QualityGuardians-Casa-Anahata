import express from 'express';
import { listarPosturasHandler } from '../controllers/posturaController';
import { verificarInstructor } from '../middlewares/middleware';

const router = express.Router();

// Cuando llegue una petición GET a la raíz ('/'), se ejecutará el middleware
// y luego el manejador 'listarPosturasHandler'.
router.get('/', verificarInstructor, listarPosturasHandler);

export default router;