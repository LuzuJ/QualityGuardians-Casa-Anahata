import request from 'supertest';
import express from 'express';
import instructorRoutes from '../../src/routes/instructorRoutes';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import authRoutes from '../../src/routes/authRoutes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- Mock de Dependencias Externas ---
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// --- Mock Mejorado de Supabase para Pruebas de Integración ---
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

// --- Configuración de la App de Express para Pruebas ---
const app = express();
app.use(express.json());
// Añadimos un middleware simple para simular la decodificación del token
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer test-token-')) {
        const id = authHeader.split('test-token-')[1];
        (req as any).user = { id: id, rol: 'instructor' }; // Simula un usuario autenticado
    }
    next();
});
app.use('/api/instructores', instructorRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/auth', authRoutes);


describe('Flujo de Integración: Rutas de Instructores y Pacientes', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Limpiamos y reconfiguramos el mock para cada prueba
        (queryBuilderMock.single ).mockClear();
    });

    const nuevoInstructor = {
        nombre: 'Instructor de Prueba',
        correo: 'integracion@test.com',
        contraseña: 'Password123!',
    };

    it('POST /api/instructores -> debería registrar un nuevo instructor correctamente', async () => {
        // Simulamos que el instructor NO existe
        (queryBuilderMock.single ).mockResolvedValueOnce({ data: null, error: null });
        // Simulamos la inserción exitosa
        (queryBuilderMock.single ).mockResolvedValueOnce({ 
            data: { id: 'inst-id-123', ...nuevoInstructor }, 
            error: null 
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

        const response = await request(app)
            .post('/api/instructores')
            .send(nuevoInstructor);
        
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.nombre).toBe(nuevoInstructor.nombre);
    });

    it('POST /api/instructores -> debería devolver un error si el instructor ya existe', async () => {
        // Simulamos que el instructor SÍ existe
        (queryBuilderMock.single ).mockResolvedValueOnce({ data: { id: 'inst-existente' }, error: null });

        const response = await request(app)
            .post('/api/instructores')
            .send(nuevoInstructor);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('El correo ya está registrado');
    });

    it('POST /api/pacientes -> debería permitir a un instructor autenticado registrar un paciente', async () => {
    const instructorId = 'inst-autenticado-123';
    const token = 'un-token-jwt-valido'; // Un token de ejemplo

    const nuevoPaciente = {
      cedula: '1234567890',
      nombre: 'Paciente de Prueba',
      correo: 'paciente@test.com',
      fechaNacimiento: '2000-01-01',
    };

    // 1. Simulamos la verificación del token en el middleware
    (jwt.verify as jest.Mock).mockReturnValue({ id: instructorId, rol: 'instructor' });

    // 2. Simulamos la lógica de negocio (que el paciente no existe y se inserta bien)
    (queryBuilderMock.single )
      .mockResolvedValueOnce({ data: null, error: null }) // Chequeo de correo
      .mockResolvedValueOnce({ data: null, error: null }) // Chequeo de cédula
      .mockResolvedValueOnce({ data: { ...nuevoPaciente, instructorId }, error: null }); // Inserción

    const response = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`) // Usamos el token
      .send(nuevoPaciente);

    // 3. Verificamos el resultado
    expect(response.statusCode).toBe(201);
    expect(response.body.instructorId).toBe(instructorId);
    expect(response.body.nombre).toBe(nuevoPaciente.nombre);
  });
});