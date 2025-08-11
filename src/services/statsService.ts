import { supabase } from '../config/supabaseClient';

/**
 * Obtiene las estadísticas generales de un instructor específico
 * 
 * Esta función recopila métricas clave para el dashboard del instructor:
 * - Total de pacientes registrados bajo su supervisión
 * - Número de series terapéuticas que ha creado
 * - Cantidad de sesiones completadas por sus pacientes en los últimos 7 días
 * 
 * @param instructorId - ID único del instructor en la base de datos
 * @returns Promise que resuelve con un objeto conteniendo:
 *   - pacientesRegistrados: Número total de pacientes asignados al instructor
 *   - seriesCreadas: Número total de series terapéuticas creadas por el instructor
 *   - sesionesCompletadasSemana: Número de sesiones completadas en la última semana por todos sus pacientes
 * @throws Error si hay problemas al obtener datos de pacientes, series o sesiones de la base de datos
 * 
 * @description
 * Utiliza una función RPC personalizada de Supabase para calcular eficientemente
 * las sesiones recientes, evitando traer todos los datos al cliente.
 */
export async function obtenerEstadisticasInstructor(instructorId: string) {
  // 1. Contar pacientes registrados bajo este instructor
  const { count: pacientesRegistrados, error: errorPacientes } = await supabase
    .from('Paciente')
    .select('cedula', { count: 'exact', head: true }) 
    .eq('instructorId', instructorId);

  if (errorPacientes) {
      console.error("Error al contar pacientes:", errorPacientes);
      throw new Error("Error de base de datos al contar pacientes.");
  }

  // 2. Contar series terapéuticas creadas por este instructor
  const { count: seriesCreadas, error: errorSeries } = await supabase
    .from('Series')
    .select('id', { count: 'exact', head: true })
    .eq('instructorId', instructorId);

  if (errorSeries) {
    console.error("Error al contar series:", errorSeries);
    throw new Error("Error de base de datos al contar series.");
  }

  // 3. Obtener sesiones completadas en los últimos 7 días usando función RPC
  // Esta función de base de datos hace un JOIN entre Paciente y Sesiones
  // y filtra por fecha reciente de manera eficiente
  const { data: sesionesCompletadasSemana, error: errorRpc } = await supabase
    .rpc('contar_sesiones_recientes_por_instructor', {
      id_instructor_param: instructorId
    });
  
  if (errorRpc) {
    console.error("Error al llamar a la función RPC para contar sesiones:", errorRpc);
    throw new Error("Error de base de datos al contar las sesiones.");
  }

  // 4. Retornar estadísticas consolidadas con valores por defecto
  return {
    pacientesRegistrados: pacientesRegistrados ?? 0,
    seriesCreadas: seriesCreadas ?? 0,
    sesionesCompletadasSemana: sesionesCompletadasSemana ?? 0,
  };
}