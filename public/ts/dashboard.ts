import { fetchApi } from './api';
import { verificarAutenticacion, cerrarSesion } from './utils';

/**
 * Script para el dashboard principal del instructor
 * @description Maneja la página principal donde los instructores ven estadísticas y resumen de su actividad
 */

/**
 * Interface para las estadísticas del dashboard
 * @interface DashboardStats
 * @description Define la estructura de datos de estadísticas que se muestran en el dashboard
 */
interface DashboardStats {
    /** Número total de pacientes registrados por el instructor */
    pacientesRegistrados: number;
    /** Número total de series de ejercicios creadas por el instructor */
    seriesCreadas: number;
    /** Número de sesiones completadas por los pacientes en la semana actual */
    sesionesCompletadasSemana: number;
}

/**
 * Inicializa el dashboard del instructor
 * @description Configura la autenticación, carga las estadísticas del instructor y actualiza la interfaz
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    document.body.classList.add('mostrar');

    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    // Obtener referencias a los elementos donde se mostrarán las estadísticas
    const strongPacientes = document.querySelector<HTMLElement>('ul li:nth-child(1) strong');
    const strongSeries = document.querySelector<HTMLElement>('ul li:nth-child(2) strong');
    const strongSesiones = document.querySelector<HTMLElement>('ul li:nth-child(3) strong');

    if (!strongPacientes || !strongSeries || !strongSesiones) return;

    try {
        // Obtener estadísticas del instructor desde el servidor
        const stats = await fetchApi<DashboardStats>('/stats'); 

        // Actualizar la interfaz con las estadísticas reales del backend
        strongPacientes.textContent = `Pacientes registrados: ${stats.pacientesRegistrados}`;
        strongSeries.textContent = `Series creadas: ${stats.seriesCreadas}`;
        strongSesiones.textContent = `Sesiones completadas esta semana: ${stats.sesionesCompletadasSemana}`;

    } catch (error) {
        console.error('No se pudieron cargar las estadísticas:', error);
        if(error instanceof Error) alert(error.message);
    }
});