import request from 'supertest';
import express from 'express';
import { listarPosturasHandler, obtenerPosturaHandler } from '../../src/controllers/posturaController';
import { obtenerTodasLasPosturas, obtenerPosturaPorId } from '../../src/services/posturaService';
jest.mock('../../src/services/posturaService');

// Configuración de una app de Express mínima para las pruebas
const app = express();
app.get('/posturas', listarPosturasHandler);
app.get('/posturas/:id', obtenerPosturaHandler);

// Convertir los mocks a Mocks de Jest
const mockObtenerTodasLasPosturas = obtenerTodasLasPosturas as jest.Mock;
const mockObtenerPosturaPorId = obtenerPosturaPorId as jest.Mock;

describe('posturaController', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listarPosturasHandler', () => {
        it('debería devolver un array de posturas con status 200 si no hay filtro', async () => {
            const mockPosturas = [
                { id: 'p1', nombre: 'Postura 1' },
                { id: 'p2', nombre: 'Postura 2' },
            ];
            mockObtenerTodasLasPosturas.mockResolvedValue(mockPosturas);

            const res = await request(app).get('/posturas');

            // 1. Verificamos que el servicio fue llamado sin argumentos
            expect(mockObtenerTodasLasPosturas).toHaveBeenCalledWith(undefined);
            // 2. Verificamos la respuesta HTTP
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosturas);
        });

        it('debería devolver un array filtrado de posturas con status 200 si se proporciona un tipo de terapia', async () => {
            const mockPosturasFiltradas = [
                { id: 'p1', nombre: 'Postura Ansiedad' },
            ];
            mockObtenerTodasLasPosturas.mockResolvedValue(mockPosturasFiltradas);

            const res = await request(app).get('/posturas').query({ tipoTerapia: 'ansiedad' });

            // 1. Verificamos que el servicio fue llamado con el filtro correcto
            expect(mockObtenerTodasLasPosturas).toHaveBeenCalledWith('ansiedad');
            // 2. Verificamos la respuesta HTTP
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosturasFiltradas);
        });

        it('debería manejar errores y devolver un status 500', async () => {
            const errorMessage = "Error en la base de datos";
            mockObtenerTodasLasPosturas.mockRejectedValue(new Error(errorMessage));

            const res = await request(app).get('/posturas');

            // 1. Verificamos la respuesta HTTP
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: expect.stringContaining(errorMessage) });
        });
    });

    describe('obtenerPosturaHandler', () => {
        it('debería devolver una postura con status 200 si se encuentra', async () => {
            const mockPostura = { id: 'p1', nombre: 'Postura Encontrada' };
            mockObtenerPosturaPorId.mockResolvedValue(mockPostura);

            const res = await request(app).get('/posturas/p1');

            // 1. Verificamos que el servicio fue llamado con el ID correcto
            expect(mockObtenerPosturaPorId).toHaveBeenCalledWith('p1');
            // 2. Verificamos la respuesta HTTP
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPostura);
        });

        it('debería devolver un status 404 si la postura no se encuentra', async () => {
            mockObtenerPosturaPorId.mockResolvedValue(null); // O undefined, según lo que devuelva tu servicio

            const res = await request(app).get('/posturas/p999');

            // 1. Verificamos que el servicio fue llamado con el ID correcto
            expect(mockObtenerPosturaPorId).toHaveBeenCalledWith('p999');
            // 2. Verificamos la respuesta HTTP
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Postura no encontrada' });
        });

        it('debería manejar errores y devolver un status 500', async () => {
            const errorMessage = "Error en el servidor";
            mockObtenerPosturaPorId.mockRejectedValue(new Error(errorMessage));

            const res = await request(app).get('/posturas/p1');

            // 1. Verificamos la respuesta HTTP
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ 
                message: "Error en el servidor al obtener la postura",
                error: errorMessage
            });
        });
    });
});