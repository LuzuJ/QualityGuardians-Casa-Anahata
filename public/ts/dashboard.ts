import { fetchApi } from './api';
import { verificarAutenticacion, cerrarSesion } from './utils';

// Definimos cómo lucirá el objeto de estadísticas
interface DashboardStats {
    pacientesRegistrados: number;
    seriesCreadas: number;
    sesionesCompletadasSemana: number;
}

document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    document.body.classList.add('mostrar');


    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    // Seleccionamos los elementos de la lista que vamos a actualizar
    const strongPacientes = document.querySelector<HTMLElement>('ul li:nth-child(1) strong');
    const strongSeries = document.querySelector<HTMLElement>('ul li:nth-child(2) strong');
    const strongSesiones = document.querySelector<HTMLElement>('ul li:nth-child(3) strong');

    if (!strongPacientes || !strongSeries || !strongSesiones) return;

    try {
        // Llamamos a nuestro nuevo endpoint
        const stats = await fetchApi<DashboardStats>('/stats'); 

        // Actualizamos el HTML con los datos reales del backend
        strongPacientes.textContent = `Pacientes registrados: ${stats.pacientesRegistrados}`;
        strongSeries.textContent = `Series creadas: ${stats.seriesCreadas}`;
        strongSesiones.textContent = `Sesiones completadas esta semana: ${stats.sesionesCompletadasSemana}`;

    } catch (error) {
        console.error('No se pudieron cargar las estadísticas:', error);
        if(error instanceof Error) alert(error.message);
    }
});