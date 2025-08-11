import { Request, Response } from 'express';
import { obtenerTodasLasPosturas, obtenerPosturaPorId } from "../services/posturaService";

/**
 * Controlador para listar posturas con filtro opcional
 * @description Obtiene todas las posturas disponibles, con posibilidad de filtrar por tipo de terapia
 * @param {Request} req - Objeto request que puede contener tipoTerapia como query parameter
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la lista de posturas o error
 * @throws {500} Cuando hay errores del servidor al obtener las posturas
 * @example
 * GET /api/posturas - Obtiene todas las posturas
 * GET /api/posturas?tipoTerapia=ansiedad - Filtra posturas por tipo de terapia
 */
export const listarPosturasHandler= async (req: Request, res: Response) => {
    try {
        const tipoTerapia = req.query.tipoTerapia as string | undefined;
        
        const posturas = await obtenerTodasLasPosturas(tipoTerapia);
        res.status(200).json(posturas);
    } catch (error: any) {
        res.status(500).json({ error: "Error en el servidor al obtener las posturas: " + error.message });
    }
};

/**
 * Controlador para obtener una postura específica por ID
 * @description Obtiene los detalles completos de una postura mediante su identificador único
 * @param {Request} req - Objeto request que contiene el ID de la postura en params
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con los datos de la postura o error
 * @throws {404} Cuando no se encuentra la postura con el ID especificado
 * @throws {500} Cuando hay errores del servidor al obtener la postura
 * @example
 * GET /api/posturas/123 - Obtiene la postura con ID 123
 */
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
