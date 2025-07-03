import { supabase } from '../config/supabaseClient';

export async function obtenerEstadisticasInstructor(instructorId: string) {
  // 1. Contar pacientes 
  const { count: pacientesRegistrados, error: errorPacientes } = await supabase
    .from('Paciente')
    .select('cedula', { count: 'exact', head: true }) 
    .eq('instructorId', instructorId);

  if (errorPacientes) {
      console.error("Error al contar pacientes:", errorPacientes);
      throw new Error("Error de base de datos al contar pacientes.");
  }

  // 2. Contar series 
  const { count: seriesCreadas, error: errorSeries } = await supabase
    .from('Series')
    .select('id', { count: 'exact', head: true })
    .eq('instructorId', instructorId);

  if (errorSeries) {
    console.error("Error al contar series:", errorSeries);
    throw new Error("Error de base de datos al contar series.");
  }

  // --- LÓGICA CORREGIDA USANDO LA FUNCIÓN DE LA BASE DE DATOS (RPC) ---
  // 3. Llamar a nuestra función para contar las sesiones de la última semana
  const { data: sesionesCompletadasSemana, error: errorRpc } = await supabase
    .rpc('contar_sesiones_recientes_por_instructor', {
      id_instructor_param: instructorId
    });
  
  if (errorRpc) {
    console.error("Error al llamar a la función RPC para contar sesiones:", errorRpc);
    throw new Error("Error de base de datos al contar las sesiones.");
  }

  // 4. Devolver el resultado final
  return {
    pacientesRegistrados: pacientesRegistrados ?? 0,
    seriesCreadas: seriesCreadas ?? 0,
    sesionesCompletadasSemana: sesionesCompletadasSemana ?? 0,
  };
}