import { registrarSesionCompletada } from '../services/pacienteService';
import { Request, Response } from 'express';

/**
 * Controlador para registrar una sesión de ejercicios completada
 * @description Registra una nueva sesión completada por un paciente autenticado con todos sus detalles
 * @param {Request} req - Objeto request que debe contener el token del paciente y los datos de la sesión en body
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON confirmando el registro de la sesión o error
 * @throws {401} Cuando el token del paciente es inválido o no está autenticado
 * @throws {400} Cuando faltan datos requeridos para registrar la sesión
 * @example
 * POST /api/sesiones
 * Body: {
 *   dolorInicial: 7,
 *   dolorFinal: 3,
 *   comentario: "Sesión completada satisfactoriamente",
 *   hora_inicio: "2024-01-15T09:00:00Z",
 *   hora_fin: "2024-01-15T09:30:00Z",
 *   tiempo_efectivo_minutos: 25,
 *   pausas: 2
 * }
 */
export const registrarSesionHandler = async (req: Request, res: Response) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) {
        return res.status(401).json({ error: 'Token de paciente inválido' });
    }

    const { dolorInicial, dolorFinal, comentario, hora_inicio, hora_fin, tiempo_efectivo_minutos, pausas } = req.body;
    if (dolorInicial === undefined || dolorFinal === undefined || !comentario || !hora_inicio || !hora_fin || tiempo_efectivo_minutos === undefined || pausas === undefined) {
        return res.status(400).json({ error: 'Faltan datos para registrar la sesión.' });
    }

    try {
        const resultado = await registrarSesionCompletada(pacienteId, {
            dolorInicial,
            dolorFinal,
            comentario,
            hora_inicio,
            hora_fin,
            tiempo_efectivo_minutos,
            pausas
        });
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};