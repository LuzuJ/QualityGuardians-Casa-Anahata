import { RequestHandler } from "express";
import { obtenerTodasLasPosturas, obtenerPosturaPorId } from "../services/posturaService";

export const listarPosturasHandler: RequestHandler = async (req, res) => {
    try {
        const posturas = await obtenerTodasLasPosturas();
        res.status(200).json(posturas);
    } catch (error: any) {
        res.status(500).json({ message: "Error en el servidor al obtener las posturas", error: error.message });
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
