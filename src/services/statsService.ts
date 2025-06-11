import { pacientes } from '../database/pacientes';
import { series } from '../database/series';

export async function obtenerEstadisticasInstructor(instructorId: string) {
    // 1. Calcular pacientes registrados por el instructor
    const pacientesRegistrados = pacientes.filter(p => p.instructorId === instructorId).length;

    // 2. Calcular series creadas por el instructor
    const seriesCreadas = series.filter(s => s.instructorId === instructorId).length;

    // 3. Calcular sesiones completadas en la última semana por sus pacientes
    const sieteDiasAtras = new Date();
    sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7); // Calcula la fecha de hace 7 días

    let sesionesCompletadasSemana = 0;
    const misPacientes = pacientes.filter(p => p.instructorId === instructorId);

    for (const paciente of misPacientes) {
        if (paciente.historialSesiones) {
            for (const sesion of paciente.historialSesiones) {
                const fechaSesion = new Date(sesion.fecha);
                if (fechaSesion >= sieteDiasAtras) {
                    sesionesCompletadasSemana++;
                }
            }
        }
    }

    // 4. Devolver el objeto con todas las estadísticas
    return {
        pacientesRegistrados,
        seriesCreadas,
        sesionesCompletadasSemana
    };
}