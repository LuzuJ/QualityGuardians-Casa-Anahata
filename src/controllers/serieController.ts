import { Request, Response } from 'express';
import { crearSerie, actualizarSerie, 
  obtenerSeriePorId, obtenerSeriesPorInstructor } from '../services/serieService';

/**
 * Controlador para crear una nueva serie de ejercicios
 * @description Crea una nueva serie de ejercicios asociada al instructor autenticado
 * @param {Request} req - Objeto request que contiene los datos de la serie en el body y el token del instructor
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la serie creada o error
 * @throws {400} Cuando faltan campos obligatorios o hay errores en los datos
 * @throws {401} Cuando el instructor no está autenticado
 * @example
 * POST /api/series
 * Body: { nombre, tipoTerapia, posturas, sesionesRecomendadas }
 */
export const crearSerieHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = (req as any).user?.id;
    const { nombre, tipoTerapia, posturas, sesionesRecomendadas } = req.body;

    if (!nombre || !tipoTerapia || !posturas?.length || !sesionesRecomendadas) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const serie = await crearSerie({
      nombre,
      tipoTerapia,
      posturas,
      sesionesRecomendadas,
      instructorId
    });

    res.status(201).json({ mensaje: 'Serie creada correctamente', serie });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para listar series del instructor autenticado
 * @description Obtiene todas las series de ejercicios creadas por el instructor autenticado
 * @param {Request} req - Objeto request que debe contener el token de autenticación del instructor
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la lista de series del instructor o error
 * @throws {401} Cuando el instructor no está autenticado
 * @throws {500} Cuando hay errores del servidor al obtener las series
 * @example
 * GET /api/series - Obtiene todas las series del instructor autenticado
 */
export const listarSeriesHandler = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      return res.status(401).json({ error: 'Instructor no autenticado' });
    }

    const seriesDelInstructor = await obtenerSeriesPorInstructor(instructorId);
    res.status(200).json(seriesDelInstructor);
    
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener las series: " + error.message });
  }
};

/**
 * Controlador para actualizar una serie existente
 * @description Actualiza los datos de una serie de ejercicios específica del instructor autenticado
 * @param {Request} req - Objeto request que contiene el ID de la serie en params y los datos actualizados en body
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la serie actualizada o error
 * @throws {400} Cuando hay errores en los datos proporcionados o la serie no pertenece al instructor
 * @throws {404} Cuando no se encuentra la serie con el ID especificado
 * @example
 * PUT /api/series/123
 * Body: { nombre, tipoTerapia, posturas, sesionesRecomendadas }
 */
export const actualizarSerieHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const instructorId = req.user?.id;
        const serieActualizada = await actualizarSerie(id, { ...req.body, instructorId });
        res.status(200).json({ mensaje: 'Serie actualizada correctamente', serie: serieActualizada });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controlador para obtener una serie específica por ID
 * @description Obtiene los detalles completos de una serie de ejercicios mediante su identificador único
 * @param {Request} req - Objeto request que contiene el ID de la serie en params
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con los datos de la serie o error
 * @throws {404} Cuando no se encuentra la serie con el ID especificado
 * @example
 * GET /api/series/123 - Obtiene la serie con ID 123
 */
export const obtenerSerieHandler = async (req: Request, res: Response) => {
    try {
        const serie = await obtenerSeriePorId(req.params.id);
        res.status(200).json(serie);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};
