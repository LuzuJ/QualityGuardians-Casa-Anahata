import request from 'supertest';
import express from 'express';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import serieRoutes from '../../src/routes/serieRoutes';

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn(),
}));

const queryBuilderMock = {
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

import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/series', serieRoutes);

describe('Flujo de Integración: Manejo de Errores', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const token = 'valid-token';
  const instructorId = 'inst-error-flow-123';

  it('debería devolver 401 si falta el token de autorización', async () => {
    const response = await request(app).get('/api/series');
    expect(response.statusCode).toBe(401);
  });

  it('debería devolver 404 si se busca un paciente que no existe', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId });
    (queryBuilderMock.single ).mockResolvedValue({ data: null, error: { message: 'No encontrado' } });

    const response = await request(app)
      .get('/api/pacientes/cedula-inexistente')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Paciente no encontrado.');
  });

  it('debería devolver 400 si faltan datos al asignar una serie', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId });

    const response = await request(app)
      .post('/api/pacientes/12345/asignar-serie')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Se requiere el ID de la serie.');
  });
});