import { supabase } from '../../src/config/supabaseClient';
import {
  crearSerie,
  obtenerTodasLasSeries,
  actualizarSerie,
  obtenerSeriePorId,
  obtenerSeriesPorInstructor,
} from '../../src/services/serieService';
import { v4 as uuidv4 } from 'uuid';
import { Serie, TipoTerapia } from '../../src/models/serie';

const queryBuilderMock = {
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock del cliente de Supabase
jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    // Hacemos que `from` devuelva nuestro constructor de consultas simulado
    from: jest.fn(() => queryBuilderMock),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('Pruebas para serieService', () => {
  // Limpiamos todos los mocks antes de cada prueba para evitar interferencias
  beforeEach(() => {
    jest.clearAllMocks();
    (queryBuilderMock.insert ).mockClear().mockReturnThis();
    (queryBuilderMock.select ).mockClear().mockReturnThis();
    (queryBuilderMock.update ).mockClear().mockReturnThis();
    (queryBuilderMock.eq ).mockClear().mockReturnThis();
    (queryBuilderMock.single ).mockClear();
  });

  describe('crearSerie', () => {
    it('debería crear y devolver una nueva serie cuando los datos son válidos', async () => {
      const mockSerieId = 'serie-123';
      (uuidv4 as jest.Mock).mockReturnValue(mockSerieId);

      const datosNuevaSerie: Omit<Serie, 'id'> = {
        nombre: 'Serie de prueba',
        tipoTerapia: TipoTerapia.ANSIEDAD,
        posturas: [{ idPostura: 'postura-1', duracionMinutos: 10 }],
        sesionesRecomendadas: 5,
        instructorId: 'instructor-abc',
      };
      const mockSerieCreada = { id: mockSerieId, ...datosNuevaSerie };

      // Simulamos la respuesta del último método en la cadena: .single()
      (queryBuilderMock.single ).mockResolvedValueOnce({
        data: mockSerieCreada,
        error: null,
      });

      const resultado = await crearSerie(datosNuevaSerie);

      expect(supabase.from).toHaveBeenCalledWith('Series');
      expect(queryBuilderMock.insert).toHaveBeenCalledWith(
        expect.objectContaining(mockSerieCreada)
      );
      expect(resultado).toEqual(mockSerieCreada);
    });

    it('debería lanzar un error si faltan datos obligatorios', async () => {
        const datosIncompletos = {
            nombre: '',
            tipoTerapia: 'ansiedad' as any,
            posturas: [],
            sesionesRecomendadas: 5,
            instructorId: 'instructor-abc',
          };
      await expect(crearSerie(datosIncompletos)).rejects.toThrow(
        'Datos incompletos para la serie'
      );
    });
  });

  describe('obtenerTodasLasSeries', () => {
    it('debería devolver un array de series', async () => {
      const mockSeries = [
        { id: 'serie-1', nombre: 'Serie 1' },
        { id: 'serie-2', nombre: 'Serie 2' },
      ];
      // Aquí, el último método es .select(), así que simulamos su respuesta
      (queryBuilderMock.select ).mockResolvedValueOnce({
        data: mockSeries,
        error: null,
      });

      const resultado = await obtenerTodasLasSeries();

      expect(supabase.from).toHaveBeenCalledWith('Series');
      expect(queryBuilderMock.select).toHaveBeenCalledWith('*');
      expect(resultado).toEqual(mockSeries);
    });
  });

  describe('actualizarSerie', () => {
    it('debería actualizar y devolver la serie con los nuevos datos', async () => {
      const idSerie = 'serie-existente';
      const datosActualizados = { nombre: 'Nombre Actualizado' };
      const mockSerieActualizada = { id: idSerie, ...datosActualizados };

      (queryBuilderMock.single ).mockResolvedValueOnce({
        data: mockSerieActualizada,
        error: null,
      });

      const resultado = await actualizarSerie(idSerie, datosActualizados);

      expect(supabase.from).toHaveBeenCalledWith('Series');
      expect(queryBuilderMock.update).toHaveBeenCalledWith(datosActualizados);
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('id', idSerie);
      expect(resultado).toEqual(mockSerieActualizada);
    });
  });

  describe('obtenerSeriePorId', () => {
    it('debería devolver una serie si se encuentra por su ID', async () => {
      const idSerie = 'serie-encontrada';
      const mockSerie = { id: idSerie, nombre: 'Serie Encontrada' };

      (queryBuilderMock.single ).mockResolvedValueOnce({
        data: mockSerie,
        error: null,
      });

      const resultado = await obtenerSeriePorId(idSerie);

      expect(supabase.from).toHaveBeenCalledWith('Series');
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('id', idSerie);
      expect(resultado).toEqual(mockSerie);
    });

    it('debería lanzar un error si la serie no se encuentra', async () => {
      const idSerie = 'serie-no-existente';
      (queryBuilderMock.single ).mockResolvedValueOnce({
        data: null,
        error: { message: 'No encontrado' },
      });

      await expect(obtenerSeriePorId(idSerie)).rejects.toThrow(
        'Serie no encontrada'
      );
    });
  });

  describe('obtenerSeriesPorInstructor', () => {
    test.each([
      ['instructor-con-series', [{ id: 'serie-a', nombre: 'Serie A' }]],
      ['instructor-sin-series', []],
    ])(
      'debería devolver las series para el instructor %s',
      async (instructorId, expectedSeries) => {
        // El último método en la cadena es .eq(), que devuelve la promesa
        (queryBuilderMock.eq ).mockResolvedValueOnce({
          data: expectedSeries,
          error: null,
        });

        const resultado = await obtenerSeriesPorInstructor(instructorId);

        expect(supabase.from).toHaveBeenCalledWith('Series');
        expect(queryBuilderMock.select).toHaveBeenCalledWith('*');
        expect(queryBuilderMock.eq).toHaveBeenCalledWith('instructorId', instructorId);
        expect(resultado).toEqual(expectedSeries);
      }
    );
  });
});