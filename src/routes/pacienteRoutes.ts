import express from 'express';
import { actualizarPacienteHandler, crearPacienteHandler, listarPacientesHandler,establecerPasswordPacienteHandler } from '../controllers/pacienteController';
import { verificarInstructor } from '../middlewares/middleware';

const router = express.Router();

router.post('/', verificarInstructor, crearPacienteHandler); 
router.get('/', verificarInstructor, listarPacientesHandler);
router.put('/:id', verificarInstructor, actualizarPacienteHandler);

router.post('/establecer-password', establecerPasswordPacienteHandler);

export default router;
