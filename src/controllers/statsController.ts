import { Request, Response } from 'express';
import { obtenerEstadisticasInstructor } from "../services/statsService";

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