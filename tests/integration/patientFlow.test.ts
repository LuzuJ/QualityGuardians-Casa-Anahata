import request from 'supertest';
import express from 'express';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import sesionRoutes from '../../src/routes/sesionRoutes';
import jwt from 'jsonwebtoken';

// --- Mocks ---
jest.mock('jsonwebtoken');

const queryBuilderMock = {
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => queryBuilderMock),
  },
}));

// --- App de Prueba ---
const app = express();
app.use(express.json());
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/sesiones', sesionRoutes);

describe('Flujo de Integración: Rutas de Pacientes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/pacientes/mi-perfil -> debería devolver el perfil del paciente autenticado', async () => {
    const pacienteId = 'paciente-perfil-123';
    const token = 'token-paciente-valido';
    const mockProfile = { cedula: pacienteId, nombre: 'Paciente Perfil', correo: 'perfil@test.com' };

    (jwt.verify as jest.Mock).mockReturnValue({ id: pacienteId, rol: 'paciente' });
    (queryBuilderMock.single ).mockResolvedValue({ data: mockProfile, error: null });

    const response = await request(app)
      .get('/api/pacientes/mi-perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.nombre).toBe(mockProfile.nombre);
  });

  it('POST /api/sesiones/registrar -> debería registrar una nueva sesión para un paciente', async () => {
    const pacienteId = 'paciente-sesion-456';
    const token = 'token-paciente-sesion';
    const datosSesion = {
        dolorInicial: 3,
        dolorFinal: 1,
        comentario: "Me sentí mucho mejor.",
        hora_inicio: "10:00:00",
        hora_fin: "10:30:00",
        tiempo_efectivo_minutos: 25,
        pausas: 1
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: pacienteId, rol: 'paciente' });
    
    // Simular la obtención del paciente y su serie asignada
    (queryBuilderMock.single ).mockResolvedValueOnce({ 
        data: { cedula: pacienteId, serieAsignada: { idSerie: 'serie-xyz', sesionesCompletadas: 1 } }, 
        error: null 
    });

    // Simular la inserción de la sesión
    (queryBuilderMock.insert ).mockResolvedValueOnce({ error: null });

    const response = await request(app)
        .post('/api/sesiones/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send(datosSesion);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Sesión registrada con éxito');
  });
});