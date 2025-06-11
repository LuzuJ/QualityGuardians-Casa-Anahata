import express from 'express';
import { obtenerEstadisticasHandler } from '../controllers/statsController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

router.get('/', verificarToken, obtenerEstadisticasHandler);

export default router;