import express from 'express';
import { registrarSesionHandler } from '../controllers/sesionController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

router.post('/registrar', verificarToken, (req, res, next) => {
	registrarSesionHandler(req, res).catch(next);
});

export default router;