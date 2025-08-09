import request from 'supertest';
import express from 'express';
import serieRoutes from '../../src/routes/serieRoutes';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import jwt from 'jsonwebtoken';

// --- Mocks ---
jest.mock('jsonwebtoken');

// Definimos un objeto para las funciones simuladas
const mockFunctions = {
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
};

// Mock de Supabase que devuelve un objeto con todas las funciones encadenables
jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockFunctions.insert.mockReturnThis(),
      select: mockFunctions.select.mockReturnThis(),
      update: mockFunctions.update.mockReturnThis(),
      eq: mockFunctions.eq.mockReturnThis(),
      single: mockFunctions.single,
    })),
  },
}));

// --- App de Prueba ---
const app = express();
app.use(express.json());
app.use('/api/series', serieRoutes);
app.use('/api/pacientes', pacienteRoutes);

describe('Flujo de Integración: Rutas de Series', () => {

  beforeEach(() => {
    // Resetea todos los mocks a su estado inicial antes de cada prueba
    jest.clearAllMocks();
  });

  const instructorId = 'inst-serie-flow-123';
  const token = 'valid-token-for-series';



  it('PUT /api/series/:id -> debería actualizar una serie existente', async () => {
    const serieId = 'serie-to-update';
    const datosActualizados = { nombre: 'Serie de Ansiedad V2' };
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });
    
    // El último método es .single(), así que simulamos su respuesta
    (mockFunctions.single ).mockResolvedValue({ data: { id: serieId, ...datosActualizados }, error: null });

    const response = await request(app)
      .put(`/api/series/${serieId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(datosActualizados);

    expect(response.statusCode).toBe(200);
    expect(response.body.serie.nombre).toBe(datosActualizados.nombre);
  });

  it('GET /api/series/:id -> debería devolver los detalles de una serie específica', async () => {
    const serieId = 'serie-detalle-456';
    const mockSerie = { id: serieId, nombre: 'Serie para Dolor de Espalda' };
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });
    
    // Configura el mock ESPECÍFICAMENTE para esta prueba
    mockFunctions.single.mockResolvedValue({ data: mockSerie, error: null });

    const response = await request(app)
      .get(`/api/series/${serieId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockSerie);
  });
  
  it('POST /api/series -> debería devolver un error 400 si faltan datos', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });
    const serieIncompleta = { nombre: 'Serie Incompleta' };

    const response = await request(app)
        .post('/api/series')
        .set('Authorization', `Bearer ${token}`)
        .send(serieIncompleta);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Todos los campos son obligatorios');
  });
});