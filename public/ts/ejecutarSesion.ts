import { fetchApi} from './api';
import type { Paciente } from './types';
import { verificarAutenticacion, cerrarSesion, showToast } from './utils';

/**
 * Script para la página de inicio de sesión de ejercicios
 * @description Maneja la interfaz previa a la ejecución donde los pacientes ven su progreso y establecen el nivel de dolor inicial
 */

/**
 * Inicializa la página de ejecutar sesión
 * @description Configura la autenticación, carga el progreso del paciente y maneja el formulario de inicio de sesión
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const form = document.querySelector<HTMLFormElement>('.formulario');
    const progresoEl = document.querySelector<HTMLDivElement>('#progreso-sesiones');

    if (!progresoEl) return;

    // Cargar y mostrar el progreso actual del paciente
    try {
        // Obtener datos completos del perfil del paciente autenticado
        const paciente = await fetchApi<Paciente>('/pacientes/mi-perfil');

        // Verificar si el paciente tiene una serie asignada y mostrar progreso
        if (paciente && paciente.serieAsignada) {
            progresoEl.innerHTML = `
                <p><strong>Serie Asignada:</strong> ${paciente.serieAsignada.nombreSerie}</p>
                <p><strong>Progreso:</strong> Has completado <strong>${paciente.serieAsignada.sesionesCompletadas}</strong> de <strong>${paciente.serieAsignada.sesionesRecomendadas}</strong> sesiones.</p>
            `;
        } else {
            progresoEl.textContent = 'Aún no tienes una serie terapéutica asignada.';
        }
    } catch (error) {
        if (error instanceof Error) showToast(error.message, 'error');
    }

    /**
     * Manejador del formulario de inicio de sesión de ejercicios
     * @description Procesa la selección del nivel de dolor inicial y redirige a la ejecución de la serie
     * @param {Event} e - Evento de submit del formulario
     */
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener el nivel de dolor/molestia seleccionado por el paciente
        const dolorInicio = (document.querySelector<HTMLSelectElement>('#dolorInicio'))?.value;
        
        // Validar que se haya seleccionado un nivel de dolor
        if (!dolorInicio) {
            return showToast('Selecciona tu nivel de molestia.', 'error');
        }
        
        // Redirigir a la página de ejecución con el nivel de dolor como parámetro
        window.location.href = `ejecucionSerie.html?dolorInicio=${dolorInicio}`;
    });
});