import { Request, RequestHandler, Response } from 'express';
import { crearSerie, obtenerTodasLasSeries } from '../services/serieService';

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
    const todasLasSeries = await obtenerTodasLasSeries();
    res.status(200).json(todasLasSeries);
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener las series", error: error.message });
  }
};
