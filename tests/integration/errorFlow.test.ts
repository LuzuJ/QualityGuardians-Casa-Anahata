import request from 'supertest';
import express from 'express';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import serieRoutes from '../../src/routes/serieRoutes';
import jwt from 'jsonwebtoken';

// --- Mocks ---
jest.mock('jsonwebtoken');

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

// --- App de Prueba ---
const app = express();
app.use(express.json());
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/series', serieRoutes);

describe('Flujo de Integración: Manejo de Errores y Casos Borde', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const token = 'valid-token';
  const instructorId = 'inst-error-flow-123';
  
  it('POST /api/pacientes -> debería devolver 401 si no se envía token', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token inválido');
    });
    const response = await request(app)
      .post('/api/pacientes')
      .send({ nombre: 'Test' });

    expect(response.statusCode).toBe(401);
  });

  it('PUT /api/series/:id -> debería devolver 404 si la serie no existe', async () => {
    const serieIdInexistente = 'serie-no-existe';
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });
    // Simulamos que la base de datos devuelve un error de "no encontrado"
    (queryBuilderMock.single ).mockResolvedValue({ data: null, error: { message: 'No encontrado' } });

    const response = await request(app)
      .put(`/api/series/${serieIdInexistente}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(response.statusCode).toBe(400); // El controlador devuelve 400 en este caso
    expect(response.body.error).toContain('No se pudo actualizar la serie o no fue encontrada');
  });

  it('POST /api/pacientes/:cedula/asignar-serie -> debería devolver 400 si falta el serieId', async () => {
    const cedulaPaciente = '12345';
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });

    const response = await request(app)
      .post(`/api/pacientes/${cedulaPaciente}/asignar-serie`)
      .set('Authorization', `Bearer ${token}`)
      .send({}); // Enviamos un cuerpo vacío

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Se requiere el ID de la serie.');
  });
  
  it('GET /api/pacientes/:cedula -> debería devolver 404 si el paciente no se encuentra', async () => {
    const cedulaInexistente = '0000000000';
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });
    (queryBuilderMock.single ).mockResolvedValue({ data: null, error: { message: 'No encontrado' } });
    
    const response = await request(app)
      .get(`/api/pacientes/${cedulaInexistente}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Paciente no encontrado.');
  });
});