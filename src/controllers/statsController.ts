import { Request, Response } from 'express';
import { obtenerEstadisticasInstructor } from "../services/statsService";

/**
 * Controlador para obtener estadísticas del instructor
 * @description Obtiene estadísticas completas del instructor autenticado, incluyendo información sobre pacientes, sesiones, series y progreso general
 * @param {Request} req - Objeto request que debe contener el token de autenticación del instructor
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con las estadísticas del instructor o error
 * @throws {401} Cuando el instructor no está autenticado o el token es inválido
 * @throws {500} Cuando hay errores del servidor al obtener las estadísticas
 */
export const obtenerEstadisticasHandler = async (req: Request, res: Response) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId) {
            res.status(401).json({ message: 'No autorizado' });
            return; 
        }

        const estadisticas = await obtenerEstadisticasInstructor(instructorId);
        res.status(200).json(estadisticas);

    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las estadísticas", error: error.message });
    }
};