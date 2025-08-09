import request from 'supertest';
import { createApp, mockDbFunctions, verifyMock } from '../helpers/testSetup';
import pacienteRoutes from '../../src/routes/pacienteRoutes';
import serieRoutes from '../../src/routes/serieRoutes';

const app = createApp([
    { path: '/api/pacientes', router: pacienteRoutes },
    { path: '/api/series', router: serieRoutes },
]);

describe('Flujo de Integración: Actualizaciones', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const token = 'valid-token';

    it('PUT /api/pacientes/:cedula -> debería actualizar un paciente', async () => {
        const cedula = 'pac-a-actualizar';
        const datosUpdate = { nombre: 'Nombre Actualizado' };
        verifyMock.mockReturnValue({ id: 'user-123' });
        (mockDbFunctions.single ).mockResolvedValue({ data: { cedula, ...datosUpdate } });

        const response = await request(app)
            .put(`/api/pacientes/${cedula}`)
            .set('Authorization', `Bearer ${token}`)
            .send(datosUpdate);

        expect(response.statusCode).toBe(200);
        expect(response.body.paciente.nombre).toBe('Nombre Actualizado');
    });

    it('PUT /api/series/:id -> debería fallar si la serie no existe', async () => {
        const serieId = 'serie-inexistente';
        verifyMock.mockReturnValue({ id: 'user-123' });
        (mockDbFunctions.single ).mockResolvedValue({ data: null, error: { message: 'No encontrado' } });

        const response = await request(app)
            .put(`/api/series/${serieId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Test' });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('No se pudo actualizar la serie');
    });
});