import { Request, RequestHandler, Response } from 'express';
import { crearSerie, actualizarSerie, 
  obtenerSeriePorId, obtenerSeriesPorInstructor } from '../services/serieService';

export const crearSerieHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorId = (req as any).user?.id;
    const { nombre, tipoTerapia, posturas, sesionesRecomendadas } = req.body;

    if (!nombre || !tipoTerapia || !posturas || !posturas.length || !sesionesRecomendadas) {
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

export const listarSeriesHandler: RequestHandler = async (req, res) => {
  try {
    // 1. Obtenemos el ID del instructor autenticado desde el token
    const instructorId = req.user?.id;
    if (!instructorId) {
      return res.status(401).json({ error: 'Instructor no autenticado' });
    }

    // 2. Llamamos al servicio pasándole el ID para filtrar
    const seriesDelInstructor = await obtenerSeriesPorInstructor(instructorId);
    res.status(200).json(seriesDelInstructor);
    
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener las series: " + error.message });
  }
};

export const actualizarSerieHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const instructorId = req.user?.id;
        const serieActualizada = await actualizarSerie(id, { ...req.body, instructorId });
        res.status(200).json({ mensaje: 'Serie actualizada correctamente', serie: serieActualizada });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const obtenerSerieHandler: RequestHandler = async (req, res) => {
    try {
        const serie = await obtenerSeriePorId(req.params.id);
        res.status(200).json(serie);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};
