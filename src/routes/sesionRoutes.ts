import express from 'express';
import { registrarSesionHandler } from '../controllers/sesionController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

router.post('/registrar', verificarToken, registrarSesionHandler);

export default router;