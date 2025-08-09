import request from 'supertest';
import { createApp, mockDbFunctions, verifyMock, compareMock, signMock } from '../helpers/testSetup';
import authRoutes from '../../src/routes/authRoutes';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import serieRoutes from '../../src/routes/serieRoutes';

// Creamos una app con todas las rutas necesarias para estas pruebas
const app = createApp([
    { path: '/api/auth', router: authRoutes },
    { path: '/api/pacientes', router: pacienteRoutes },
    { path: '/api/series', router: serieRoutes },
]);

describe('Pruebas de Integración para Cobertura de Controladores', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Pruebas para cubrir authController.ts (login de paciente) ---
    describe('Flujo de Autenticación de Paciente', () => {
        it('POST /api/auth/login -> debería autenticar a un paciente activo', async () => {
            const loginData = { correo: 'paciente@test.com', contraseña: 'Password123!', rol: 'paciente' };
            const mockPaciente = { cedula: 'pac-123', contraseña: 'hashed_password', estado: 'activo' };

            (mockDbFunctions.single ).mockResolvedValue({ data: mockPaciente });
            compareMock.mockResolvedValue(true);
            signMock.mockReturnValue('paciente-jwt-token');

            const response = await request(app).post('/api/auth/login').send(loginData);

            expect(response.statusCode).toBe(200);
            expect(response.body.rol).toBe('paciente');
        });

        it('POST /api/auth/login -> debería rechazar a un paciente pendiente', async () => {
            const loginData = { correo: 'paciente@test.com', contraseña: 'Password123!', rol: 'paciente' };
            const mockPaciente = { cedula: 'pac-123', contraseña: 'hashed_password', estado: 'pendiente' };

            (mockDbFunctions.single ).mockResolvedValue({ data: mockPaciente });

            const response = await request(app).post('/api/auth/login').send(loginData);

            expect(response.statusCode).toBe(401);
            expect(response.body.error).toContain('cuenta no activada');
        });
    });

    // --- Pruebas para cubrir pacienteController.ts ---
    describe('Flujo de Establecer Contraseña de Paciente', () => {
        it('POST /api/pacientes/establecer-password -> debería fallar si el paciente ya está activo', async () => {
            const passwordData = { correo: 'activo@paciente.com', nuevaContraseña: 'NewPassword123!' };
            const mockPaciente = { estado: 'activo' };

            (mockDbFunctions.single ).mockResolvedValueOnce({ data: mockPaciente });

            const response = await request(app).post('/api/pacientes/establecer-password').send(passwordData);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe('Esta cuenta ya ha sido activada.');
        });
    });

    // --- Pruebas para cubrir el middleware.ts ---
    describe('Casos de Error del Middleware', () => {
        it('debería devolver 401 si jwt.verify lanza un error (token inválido/expirado)', async () => {
            // Simulamos que el token es inválido o expirado
            verifyMock.mockImplementation(() => {
                throw new Error('jwt malformed');
            });

            const response = await request(app)
                .get('/api/series')
                .set('Authorization', 'Bearer token-invalido');

            expect(response.statusCode).toBe(401);
            expect(response.body.error).toBe('Token inválido');
        });
    });
});