import { registrarSesionCompletada } from '../services/pacienteService';
import { Request, Response } from 'express';

export const registrarSesionHandler = async (req: Request, res: Response) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) {
        return res.status(401).json({ error: 'Token de paciente inválido' });
    }
    try {
        const resultado = await registrarSesionCompletada(pacienteId, req.body);
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};