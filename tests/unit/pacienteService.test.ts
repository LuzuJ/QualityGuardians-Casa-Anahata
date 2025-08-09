import { supabase } from '../../src/config/supabaseClient';
import { registrarPaciente, actualizarPaciente, obtenerHistorialDePaciente, asignarSerieAPaciente, obtenerSerieAsignada } from '../../src/services/pacienteService';
import * as posturaService from '../../src/services/posturaService';

// Mock de las dependencias
jest.mock('../../src/utils/validacion');
const queryBuilderMock = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn(),
  };
  
  jest.mock('../../src/config/supabaseClient', () => ({
    supabase: {
      from: jest.fn(() => queryBuilderMock),
    },
  }));

describe('Pruebas para pacienteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para registrarPaciente
  describe('registrarPaciente', () => {
    it('debería registrar un nuevo paciente si no existe previamente', async () => {
      const instructorId = 'inst-001';
      const datosPaciente = { 
        nombre: 'Juan', 
        correo: 'juan@test.com',
        fechaNacimiento: '2000-01-01', // Agrega una fecha válida
        instructorId // Incluye instructorId en datosPaciente
      };
      const pacienteCreado = { ...datosPaciente, estado: 'pendiente' };

      // Simulamos que no existe ni por correo ni por cédula
      (queryBuilderMock.single )
        .mockResolvedValueOnce({ data: null }) // Chequeo de correo
        .mockResolvedValueOnce({ data: null }); // Chequeo de cédula
      
      // Simulamos la inserción exitosa
      (queryBuilderMock.select ).mockReturnThis();
      (queryBuilderMock.single ).mockResolvedValueOnce({ data: pacienteCreado, error: null });

      const resultado = await registrarPaciente(datosPaciente, instructorId);

      expect(supabase.from).toHaveBeenCalledWith('Paciente');
      expect(queryBuilderMock.insert).toHaveBeenCalledWith(expect.objectContaining(pacienteCreado));
      expect(resultado).toEqual(pacienteCreado);
    });

    it('debería lanzar un error si el correo ya está registrado', async () => {
      const datosPaciente = { 
        nombre: 'Ana', 
        correo: 'ana@existente.com',
        fechaNacimiento: '1990-01-01',
        instructorId: 'inst-002'
      };
      (queryBuilderMock.single ).mockResolvedValueOnce({ data: { cedula: '123' } }); // Correo existe

      await expect(registrarPaciente(datosPaciente, 'inst-002')).rejects.toThrow('El correo ya está registrado');
    });
  });

  // Pruebas para actualizarPaciente
  describe('actualizarPaciente', () => {
    it('debería actualizar los datos del paciente correctamente', async () => {
      const cedula = 'pac-001';
      const datosUpdate = { nombre: 'Carlos Actualizado' };
      (queryBuilderMock.single ).mockResolvedValueOnce({ data: { cedula, ...datosUpdate }, error: null });

      const resultado = await actualizarPaciente(cedula, datosUpdate);

      expect(supabase.from).toHaveBeenCalledWith('Paciente');
      expect(queryBuilderMock.update).toHaveBeenCalledWith(datosUpdate);
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('cedula', cedula);
      expect(resultado.nombre).toBe('Carlos Actualizado');
    });
  });

  // Pruebas para obtenerHistorialDePaciente
  describe('obtenerHistorialDePaciente', () => {
    it('debería devolver el historial de sesiones de un paciente', async () => {
      const cedula = 'pac-002';
      const mockHistorial = [{ id: 'sesion-1', comentario: 'Buena sesión' }];
      (queryBuilderMock.order ).mockResolvedValueOnce({ data: mockHistorial, error: null });

      const resultado = await obtenerHistorialDePaciente(cedula);

      expect(supabase.from).toHaveBeenCalledWith('Sesiones');
      expect(queryBuilderMock.eq).toHaveBeenCalledWith('pacienteId', cedula);
      expect(resultado).toEqual(mockHistorial);
    });
  });

  describe('asignarSerieAPaciente', () => {
    it('debería lanzar un error si la serie a asignar no se encuentra', async () => {
      // Simulamos que la serie no se encuentra
      (queryBuilderMock.single ).mockResolvedValueOnce({ data: null, error: null });

      await expect(asignarSerieAPaciente('paciente-123', 'serie-inexistente'))
        .rejects.toThrow('Serie no encontrada');
    });
  });

  describe('obtenerSerieAsignada', () => {
    it('debería lanzar un error si el paciente no tiene una serie asignada', async () => {
      // Simulamos que el paciente no tiene la propiedad serieAsignada
      (queryBuilderMock.single ).mockResolvedValueOnce({ data: { cedula: 'pac-123' }, error: null });
      
      await expect(obtenerSerieAsignada('pac-123')).rejects.toThrow('No tienes una serie terapéutica asignada.');
    });

    it('debería enriquecer la serie con los detalles completos de las posturas', async () => {
        const mockPaciente = { serieAsignada: { idSerie: 'serie-abc' } };
        const mockSerieIncompleta = { id: 'serie-abc', posturas: [{ idPostura: 'p1', duracionMinutos: 10 }] };
        const mockPosturaCompleta = { id: 'p1', nombre: 'Postura Completa', descripcion: [] };

        // Espiamos y simulamos obtenerPosturaPorId
        const spy = jest.spyOn(posturaService, 'obtenerPosturaPorId').mockResolvedValue(mockPosturaCompleta as any);

        (queryBuilderMock.single )
            .mockResolvedValueOnce({ data: mockPaciente, error: null }) // Encontrar paciente
            .mockResolvedValueOnce({ data: mockSerieIncompleta, error: null }); // Encontrar serie

        const resultado = await obtenerSerieAsignada('pac-123');

        expect(resultado.secuencia[0].nombre).toBe('Postura Completa');
        expect(resultado.secuencia[0].duracionMinutos).toBe(10);
        spy.mockRestore(); // Limpiamos el espía
    });
  });
  
});