import { supabase } from '../../src/config/supabaseClient';
import { obtenerEstadisticasInstructor } from '../../src/services/statsService';

// --- Mock Mejorado de Supabase ---
const queryBuilderMock = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn(), // Hacemos que .eq() sea la función que simularemos
};

jest.mock('../../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => queryBuilderMock),
    rpc: jest.fn(), // rpc es un método directo de supabase
  },
}));

describe('Pruebas para statsService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería devolver las estadísticas correctas para un instructor', async () => {
    const instructorId = 'inst-stats-123';

    // 1. Simular conteo de pacientes (la promesa se resuelve en .eq)
    (queryBuilderMock.eq )
      .mockResolvedValueOnce({ count: 10, error: null });
      
    // 2. Simular conteo de series (la promesa se resuelve en .eq)
    (queryBuilderMock.eq )
      .mockResolvedValueOnce({ count: 5, error: null });

    // 3. Simular la llamada RPC para sesiones
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: 7, error: null });

    // Ejecutar la función a probar
    const stats = await obtenerEstadisticasInstructor(instructorId);

    // Verificar los resultados
    expect(stats).toEqual({
      pacientesRegistrados: 10,
      seriesCreadas: 5,
      sesionesCompletadasSemana: 7,
    });

    // Verificar que se llamó a la función RPC correctamente
    expect(supabase.rpc).toHaveBeenCalledWith('contar_sesiones_recientes_por_instructor', {
      id_instructor_param: instructorId,
    });
  });

  it('debería manejar errores si falla la consulta de pacientes', async () => {
    // Simular un error al contar pacientes
    (queryBuilderMock.eq ).mockResolvedValueOnce({ count: null, error: new Error('DB Error') });
    
    // Verificar que la función lanza el error esperado
    await expect(obtenerEstadisticasInstructor('id-test')).rejects.toThrow('Error de base de datos al contar pacientes.');
  });

  it('debería manejar errores si falla la consulta de series', async () => {
    // Simular éxito al contar pacientes pero error al contar series
    (queryBuilderMock.eq )
      .mockResolvedValueOnce({ count: 10, error: null }) // Pacientes OK
      .mockResolvedValueOnce({ count: null, error: new Error('DB Error') }); // Series FALLA

    await expect(obtenerEstadisticasInstructor('id-test')).rejects.toThrow('Error de base de datos al contar series.');
  });
});