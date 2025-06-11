import { supabase } from '../config/supabaseClient';

export async function obtenerEstadisticasInstructor(instructorId: string) {
  const { count: pacientesRegistrados, error: errorPacientes } = await supabase
    .from('Paciente')
    .select('cedula', { count: 'exact', head: true }) 
    .eq('instructorId', instructorId);

  if (errorPacientes) throw new Error("Error al contar pacientes.");

  const { count: seriesCreadas, error: errorSeries } = await supabase
    .from('Series')
    .select('id', { count: 'exact', head: true })
    .eq('instructorId', instructorId);

  if (errorSeries) throw new Error("Error al contar series.");

  const { data: pacientes, error: errorHistorial } = await supabase
    .from('Paciente')
    .select('historialSesiones')
    .eq('instructorId', instructorId);

  if (errorHistorial) throw new Error("Error al obtener historial de pacientes.");

  const sieteDiasAtras = new Date();
  sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
  let sesionesCompletadasSemana = 0;

  for (const paciente of pacientes) {
    if (paciente.historialSesiones) {
      for (const sesion of paciente.historialSesiones) {
        if (new Date(sesion.fecha) >= sieteDiasAtras) {
          sesionesCompletadasSemana++;
        }
      }
    }
  }

  return {
    pacientesRegistrados: pacientesRegistrados ?? 0,
    seriesCreadas: seriesCreadas ?? 0,
    sesionesCompletadasSemana
  };
}