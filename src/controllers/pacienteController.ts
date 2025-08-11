import { Request, Response } from 'express';
import { 
    registrarPaciente, obtenerPacientesPorInstructor, actualizarPaciente, 
    establecerPasswordPaciente, asignarSerieAPaciente, obtenerSerieAsignada, 
    obtenerHistorialDePaciente, obtenerPacientePorCedula 
} from '../services/pacienteService';

/**
 * Controlador para crear un nuevo paciente
 * @description Registra un nuevo paciente asociándolo al instructor autenticado
 * @param {Request} req - Objeto request de Express que contiene los datos del paciente en el body
 * @param {Response} res - Objeto response de Express para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con el paciente creado o error
 * @throws {401} Cuando el instructor no está autenticado
 * @throws {400} Cuando hay errores en los datos del paciente
 */
export const crearPacienteHandler= async (req: Request, res: Response) => {
  try {
    // Obtenemos el ID del instructor desde el token (del usuario autenticado)
    const instructorId = req.user?.id;
    if (!instructorId) {
        return res.status(401).json({ error: 'Instructor no autenticado o token inválido.' });
    }

    const { instructorId: _omit, ...datosPaciente } = { ...req.body };
    const paciente = await registrarPaciente(datosPaciente, instructorId);
    res.status(201).json(paciente);

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
 
/**
 * Controlador para actualizar los datos de un paciente
 * @description Actualiza la información de un paciente existente identificado por su cédula
 * @param {Request} req - Objeto request que contiene la cédula en params y los nuevos datos en body
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con el paciente actualizado o error
 * @throws {404} Cuando no se encuentra el paciente
 * @throws {400} Cuando hay errores en los datos proporcionados
 */
export const actualizarPacienteHandler= async (req: Request, res: Response) => {
  try {
    const pacienteActualizado = await actualizarPaciente(req.params.cedula, req.body);
    res.json({ mensaje: 'Paciente actualizado correctamente', paciente: pacienteActualizado });
  } catch (error: any) {
    if (error.message.includes('encontrado')) return res.status(404).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para listar pacientes de un instructor
 * @description Obtiene todos los pacientes asociados al instructor autenticado
 * @param {Request} req - Objeto request que debe contener el token de autenticación del instructor
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la lista de pacientes o error
 * @throws {401} Cuando el instructor no está autenticado
 * @throws {500} Cuando hay errores al obtener la lista de pacientes
 */
export const listarPacientesHandler= async (req: Request, res: Response) => {
    try {
        const instructorId = req.user?.id;
        if (!instructorId) {
            return res.status(401).json({ error: 'Instructor no autenticado' });
        }
        
        const pacientes = await obtenerPacientesPorInstructor(instructorId);
        res.status(200).json(pacientes);

    } catch (error: any) {
        res.status(500).json({ error: "No se pudo obtener la lista de pacientes: " + error.message });
    }
};

/**
 * Controlador para establecer/cambiar la contraseña de un paciente
 * @description Permite establecer o cambiar la contraseña de un paciente mediante su correo electrónico
 * @param {Request} req - Objeto request que contiene correo y nuevaContraseña en el body
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON confirmando el cambio de contraseña o error
 * @throws {400} Cuando faltan datos requeridos (correo o contraseña)
 * @throws {404} Cuando no se encuentra el paciente con el correo especificado
 */
export const establecerPasswordPacienteHandler= async (req: Request, res: Response) => {
  try {
    const { correo, nuevaContraseña } = req.body;
    if (!correo || !nuevaContraseña) return res.status(400).json({ error: 'El correo y la nueva contraseña son obligatorios.' });
    const resultado = await establecerPasswordPaciente(correo, nuevaContraseña);
    res.status(200).json(resultado);
  } catch (error: any) {
    if (error.message.includes("encontró")) return res.status(404).json({ error: error.message });
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para asignar una serie de ejercicios a un paciente
 * @description Asigna una serie específica de ejercicios a un paciente identificado por su cédula
 * @param {Request} req - Objeto request que contiene la cédula del paciente en params y serieId en body
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON confirmando la asignación o error
 * @throws {400} Cuando no se proporciona el ID de la serie
 * @throws {404} Cuando no se encuentra el paciente o la serie
 */
export const asignarSerieHandler= async (req: Request, res: Response) => {
  try {
    const { cedula } = req.params;
    const { serieId } = req.body;
    if (!serieId) return res.status(400).json({ error: 'Se requiere el ID de la serie.' });
    const paciente = await asignarSerieAPaciente(cedula, serieId);
    res.status(200).json({ message: 'Serie asignada correctamente', paciente });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Controlador para obtener la serie asignada al paciente autenticado
 * @description Permite al paciente autenticado obtener información de la serie que tiene asignada
 * @param {Request} req - Objeto request que debe contener el token de autenticación del paciente
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la serie asignada o error
 * @throws {401} Cuando el paciente no está autenticado
 * @throws {404} Cuando no se encuentra la serie asignada
 */
export const obtenerMiSerieHandler= async (req: Request, res: Response) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) return res.status(401).json({ error: 'Token inválido' });
    try {
        const serie = await obtenerSerieAsignada(pacienteId);
        res.status(200).json(serie);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

/**
 * Controlador para obtener el historial de sesiones de un paciente específico
 * @description Permite a un instructor obtener el historial completo de sesiones de un paciente por su cédula
 * @param {Request} req - Objeto request que contiene la cédula del paciente en params
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con el historial de sesiones o error
 * @throws {404} Cuando no se encuentra el paciente o su historial
 */
export const obtenerHistorialHandler= async (req: Request, res: Response) => {
    const pacienteId = req.params.cedula;
    try {
        const historial = await obtenerHistorialDePaciente(pacienteId);
        res.status(200).json(historial);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

/**
 * Controlador para obtener el historial del paciente autenticado
 * @description Permite al paciente autenticado obtener su propio historial de sesiones
 * @param {Request} req - Objeto request que debe contener el token de autenticación del paciente
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con el historial de sesiones del paciente o error
 * @throws {401} Cuando el paciente no está autenticado
 * @throws {404} Cuando no se encuentra el historial del paciente
 */
export const obtenerMiHistorialHandler= async (req: Request, res: Response) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) return res.status(401).json({ error: 'Token inválido' });
    try {
        const historial = await obtenerHistorialDePaciente(pacienteId);
        res.status(200).json(historial);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

/**
 * Controlador para obtener información de un paciente específico
 * @description Obtiene la información completa de un paciente mediante su cédula
 * @param {Request} req - Objeto request que contiene la cédula del paciente en params
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la información del paciente o error
 * @throws {404} Cuando no se encuentra el paciente con la cédula especificada
 */
export const obtenerPacienteHandler= async (req: Request, res: Response) => {
    try {
        const paciente = await obtenerPacientePorCedula(req.params.cedula);
        res.status(200).json(paciente);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};

/**
 * Controlador para obtener el perfil del paciente autenticado
 * @description Permite al paciente autenticado obtener su propia información de perfil
 * @param {Request} req - Objeto request que debe contener el token de autenticación del paciente
 * @param {Response} res - Objeto response para enviar la respuesta
 * @returns {Promise<void>} Respuesta JSON con la información del perfil del paciente o error
 * @throws {401} Cuando el paciente no está autenticado
 * @throws {404} Cuando no se encuentra el perfil del paciente
 */
export const obtenerMiPerfilHandler= async (req: Request, res: Response) => {
    const pacienteId = req.user?.id;
    if (!pacienteId) return res.status(401).json({ error: 'Token inválido' });
    try {
        const perfil = await obtenerPacientePorCedula(pacienteId);
        res.status(200).json(perfil);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};