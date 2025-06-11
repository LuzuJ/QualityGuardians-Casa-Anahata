
import express from 'express';
import { obtenerEstadisticasHandler } from '../controllers/statsController';
import { verificarToken } from '../middlewares/middleware'; // Usamos el middleware genérico

const router = express.Router();

// La ruta debe estar protegida, solo un instructor logueado puede ver sus stats
router.get('/', verificarToken, obtenerEstadisticasHandler);

export default router;