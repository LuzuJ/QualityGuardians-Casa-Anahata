import { RequestHandler } from "express"; // Usar RequestHandler es una buena práctica
import { obtenerEstadisticasInstructor } from "../services/statsService";

export const obtenerEstadisticasHandler: RequestHandler = async (req, res) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId) {
            // Se quita el 'return' de la respuesta. Solo se envía.
            res.status(401).json({ message: 'No autorizado' });
            return; // Este 'return' solo (sin valor) está bien para salir de la función aquí.
        }

        const estadisticas = await obtenerEstadisticasInstructor(instructorId);
        res.status(200).json(estadisticas);

    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las estadísticas", error: error.message });
    }
};