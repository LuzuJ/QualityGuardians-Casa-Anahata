import { registrarSesionCompletada } from '../services/pacienteService';
import { Request, Response } from 'express';

export const registrarSesionHandler = async (req: Request, res: Response) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) {
        return res.status(401).json({ error: 'Token de paciente inválido' });
    }

    const { dolorInicial, dolorFinal, comentario, hora_inicio, hora_fin, tiempo_efectivo_minutos, pausas } = req.body;
    if (dolorInicial === undefined || dolorFinal === undefined || !comentario || !hora_inicio || !hora_fin || tiempo_efectivo_minutos === undefined || pausas === undefined) {
        return res.status(400).json({ error: 'Faltan datos para registrar la sesión.' });
    }

    try {
        const resultado = await registrarSesionCompletada(pacienteId, {
            dolorInicial,
            dolorFinal,
            comentario,
            hora_inicio,
            hora_fin,
            tiempo_efectivo_minutos,
            pausas
        });
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};