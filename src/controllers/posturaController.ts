import { RequestHandler } from "express";
import { obtenerTodasLasPosturas } from "../services/posturaService";

export const listarPosturasHandler: RequestHandler = async (req, res) => {
    try {
        // Llama al servicio para obtener los datos
        const posturas = await obtenerTodasLasPosturas();

        // Envía los datos como respuesta JSON con un estado 200 (OK)
        res.status(200).json(posturas);

    } catch (error: any) {
        // Si algo sale mal, envía un error
        res.status(500).json({ message: "Error en el servidor al obtener las posturas", error: error.message });
    }
};