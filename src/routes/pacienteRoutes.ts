import express from 'express';
import { 
    crearPacienteHandler, listarPacientesHandler, actualizarPacienteHandler,
    establecerPasswordPacienteHandler, asignarSerieHandler, obtenerMiSerieHandler, 
    obtenerHistorialHandler, obtenerMiHistorialHandler 
} from '../controllers/pacienteController';
import { verificarToken } from '../middlewares/middleware';

const router = express.Router();

// --- Rutas de Instructor sobre Pacientes (requieren token) ---
router.post('/', verificarToken, crearPacienteHandler); 
router.get('/', verificarToken, listarPacientesHandler);
router.put('/:id', verificarToken, actualizarPacienteHandler);
router.post('/:id/asignar-serie', verificarToken, asignarSerieHandler);
router.get('/:id/historial', verificarToken, obtenerHistorialHandler);

// --- Ruta Pública de Paciente (no requiere token) ---
router.post('/establecer-password', establecerPasswordPacienteHandler);

// --- Rutas de Paciente autenticado (requieren token) ---
router.get('/mi-serie', verificarToken, obtenerMiSerieHandler);
router.get('/mi-historial', verificarToken, obtenerMiHistorialHandler);

export default router;