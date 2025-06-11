import { Request, Response, RequestHandler } from 'express';
import { obtenerPacientesPorInstructor, registrarPaciente, actualizarPaciente, 
  establecerPasswordPaciente, asignarSerieAPaciente, registrarSesionCompletada, 
  obtenerSerieAsignada, obtenerHistorialDePaciente} from '../services/pacienteService';

export const crearPacienteHandler: RequestHandler = async (req, res) => {
  try {
    // El controlador solo pasa los datos que vienen del formulario.
    const { nombre, correo, fechaNacimiento, genero, observaciones } = req.body;

    if (!nombre || !correo || !fechaNacimiento) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ error: 'Instructor no autenticado' });
      return;
    }

    // CORRECCIÓN: Ya no pasamos 'estado' ni 'historialSesiones'. El servicio se encarga.
    const paciente = await registrarPaciente({
      nombre,
      correo,
      fechaNacimiento,
      genero,
      observaciones,
      instructorId,
    });
    res.status(201).json(paciente);
    return;
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }
};

export const actualizarPacienteHandler: RequestHandler = async (req, res) => {
  try {
    const pacienteId = req.params.id;
    const datosParaActualizar = req.body;

    const pacienteActualizado = await actualizarPaciente(pacienteId, datosParaActualizar);

    res.json({ mensaje: 'Paciente actualizado correctamente', paciente: pacienteActualizado });
  } catch (error: any) {
    if (error.message.includes('Paciente no encontrado')) {
        res.status(404).json({ error: error.message });
        return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const listarPacientesHandler = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  if (!instructorId) {
    res.status(400).json({ error: 'Instructor no autenticado' });
    return;
  }
  const pacientes = await obtenerPacientesPorInstructor(instructorId);
  res.json(pacientes);
};

export const establecerPasswordPacienteHandler: RequestHandler = async (req, res) => {
  try {
    const { correo, nuevaContraseña } = req.body;

    if (!correo || !nuevaContraseña) {
      res.status(400).json({ error: 'El correo y la nueva contraseña son obligatorios.' });
      return;
    }

    const resultado = await establecerPasswordPaciente(correo, nuevaContraseña);

    res.status(200).json(resultado);

  } catch (error: any) {
    if (error.message.includes("No se encontró")) {
        res.status(404).json({ error: error.message });
        return;
    }
  }
};

export const asignarSerieHandler: RequestHandler = async (req, res) => {
  try {
    const { id: pacienteId } = req.params;
    const { serieId } = req.body;

    if (!serieId) {
      res.status(400).json({ error: 'Se requiere el ID de la serie.' });
      return;
    }

    const pacienteActualizado = await asignarSerieAPaciente(pacienteId, serieId);
    res.status(200).json({ message: 'Serie asignada correctamente', paciente: pacienteActualizado });

  } catch (error: any) {
    res.status(404).json({ error: error.message }); // 404 si el paciente o serie no se encuentran
  }
};

export const obtenerMiSerieHandler: RequestHandler = async (req, res) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    try {
        const serie = await obtenerSerieAsignada(pacienteId);
        res.status(200).json(serie);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

export const registrarSesionHandler: RequestHandler = async (req, res) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    try {
        const resultado = await registrarSesionCompletada(pacienteId, req.body);
        res.status(201).json(resultado);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const obtenerHistorialHandler: RequestHandler = async (req, res) => {
    try {
        const { id: pacienteId } = req.params;
        const historial = await obtenerHistorialDePaciente(pacienteId);
        res.status(200).json(historial);
    } catch (error: any) {
        // Si el servicio lanza "Paciente no encontrado", se devuelve un 404
        res.status(404).json({ error: error.message });
    }
};

export const obtenerMiHistorialHandler: RequestHandler = async (req, res) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) {
        res.status(401).json({ error: 'Token de paciente inválido' });
        return;
    }
    try {
        const historial = await obtenerHistorialDePaciente(pacienteId);
        res.status(200).json(historial);
        return;
    } catch (error: any) {
        res.status(404).json({ error: error.message });
        return;
    }
};