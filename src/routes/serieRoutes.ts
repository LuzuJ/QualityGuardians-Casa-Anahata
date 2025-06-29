import express from 'express';
import { crearSerieHandler, listarSeriesHandler, actualizarSerieHandler, obtenerSerieHandler } from '../controllers/serieController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

router.post('/', verificarToken, crearSerieHandler);

router.get('/', verificarToken, listarSeriesHandler);

router.put('/:id', verificarToken, actualizarSerieHandler)

router.get('/:id', verificarToken, obtenerSerieHandler);

export default router;
