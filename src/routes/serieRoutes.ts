import express from 'express';
import { crearSerieHandler, listarSeriesHandler } from '../controllers/serieController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

router.post('/', verificarToken, crearSerieHandler);

router.get('/', verificarToken, listarSeriesHandler);

export default router;
