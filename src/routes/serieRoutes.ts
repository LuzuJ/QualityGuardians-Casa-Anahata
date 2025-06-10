import express from 'express';
import { crearSerieHandler, listarSeriesHandler } from '../controllers/serieController';
import { verificarInstructor } from '../middlewares/middleware';

const router = express.Router();

router.post('/', verificarInstructor, crearSerieHandler);

router.get('/', verificarInstructor, listarSeriesHandler);

export default router;
