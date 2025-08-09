import request from 'supertest';
import { createApp, mockDbFunctions, compareMock, signMock } from '../helpers/testSetup';
import authRoutes from '../../src/routes/authRoutes';

const app = createApp([{ path: '/api/auth', router: authRoutes }]);

describe('Pruebas de Integración para AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /api/auth/login -> debería autenticar a un instructor', async () => {
        const loginData = { correo: 'test@inst.com', contraseña: 'Password123!', rol: 'instructor' };
        const mockInstructor = { id: 'inst-123', contraseña: 'hashed_password' };
        
        (mockDbFunctions.single ).mockResolvedValue({ data: mockInstructor });
        compareMock.mockResolvedValue(true);
        signMock.mockReturnValue('fake-jwt-token');

        const response = await request(app).post('/api/auth/login').send(loginData);

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBe('fake-jwt-token');
    });
});