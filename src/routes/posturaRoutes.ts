import express from 'express';
import { listarPosturasHandler, obtenerPosturaHandler } from '../controllers/posturaController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

router.get('/', verificarToken, listarPosturasHandler);
router.get('/:id', verificarToken, obtenerPosturaHandler);

export default router;