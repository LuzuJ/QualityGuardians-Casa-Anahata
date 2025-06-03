import express from 'express';
import { crearPacienteHandler } from '../controllers/pacienteController';
import { verificarInstructor } from '../middlewares/middleware';

const router = express.Router();

router.post('/', verificarInstructor, crearPacienteHandler); 

export default router;
