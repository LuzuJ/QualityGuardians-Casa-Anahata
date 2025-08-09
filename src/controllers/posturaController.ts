import { Request, Response } from 'express';
import { obtenerTodasLasPosturas, obtenerPosturaPorId } from "../services/posturaService";

export const listarPosturasHandler= async (req: Request, res: Response) => {
    try {
        // Leemos el parámetro 'tipoTerapia' de la query en la URL (ej: /api/posturas?tipoTerapia=ansiedad)
        const tipoTerapia = req.query.tipoTerapia as string | undefined;
        
        // Pasamos el filtro al servicio
        const posturas = await obtenerTodasLasPosturas(tipoTerapia);
        res.status(200).json(posturas);
    } catch (error: any) {
        res.status(500).json({ error: "Error en el servidor al obtener las posturas: " + error.message });
    }
};

export const obtenerPosturaHandler = async (req: Request, res: Response) => {
    try {
        const idPostura = req.params.id;
        const postura = await obtenerPosturaPorId(idPostura);

        if (!postura) {
            return res.status(404).json({ message: 'Postura no encontrada' });
        }
        res.status(200).json(postura);

    } catch (error: any) {
        console.error("Error al obtener posturas:", error);

        res.status(500).json({ 
            message: "Error en el servidor al obtener la postura",
            error: error.message
        });
    }
};
