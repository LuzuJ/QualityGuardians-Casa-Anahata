import { RequestHandler } from "express";
import { obtenerTodasLasPosturas, obtenerPosturaPorId } from "../services/posturaService";

export const listarPosturasHandler: RequestHandler = async (req, res) => {
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

export const obtenerPosturaHandler: RequestHandler = async (req, res) => {
    try {
        const idPostura = req.params.id;
        const postura = await obtenerPosturaPorId(idPostura);

        if (!postura) {
            res.status(404).json({ message: 'Postura no encontrada' });
            return;
        }
        res.status(200).json(postura);

    } catch (error: any) {
        res.status(500).json({ message: "Error en el servidor al obtener la postura" });
    }
};
