import { fetchApi } from "./api";
import { showToast, verificarAutenticacion, cerrarSesion } from "./utils";

/**
 * Script para la página de registro de sesión completada
 * @description Maneja el formulario de evaluación post-ejercicio donde los pacientes registran dolor final y comentarios
 */

/**
 * Inicialización del script de registro de sesión
 * @description Event listener principal que configura la funcionalidad de registro de evaluación post-sesión
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const form = document.querySelector<HTMLFormElement>('.formulario');
    
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const horaInicio = urlParams.get('horaInicio');
    const horaFin = urlParams.get('horaFin');
    const tiempoEfectivoMinutos = urlParams.get('tiempoEfectivoMinutos');
    const pausas = urlParams.get('pausas');

    if (!dolorInicio || !horaInicio || !horaFin) {
        showToast('Faltan datos de la sesión anterior. No se puede registrar la evaluación.', 'error');
        return;
    }

    /**
     * Maneja el envío del formulario de evaluación post-sesión
     * @description Procesa los datos de evaluación del paciente y los envía al servidor
     * @param {Event} e - Evento de submit del formulario
     */
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener valores de la evaluación del paciente
        const dolorFinal = (document.querySelector<HTMLSelectElement>('#dolorFinal'))?.value;
        const comentario = (document.querySelector<HTMLTextAreaElement>('#comentario'))?.value;

        if (!dolorFinal || !comentario) {
            return showToast('Por favor, completa todos los campos.', 'error');
        }

        // Construir objeto con todos los datos de la sesión completada
        const datosDeSesion = {
            dolorInicial: parseInt(dolorInicio, 10),
            dolorFinal: parseInt(dolorFinal, 10),
            comentario: comentario,
            hora_inicio: new Date(horaInicio).toTimeString().split(' ')[0], // Formato HH:MM:SS
            hora_fin: new Date(horaFin).toTimeString().split(' ')[0], // Formato HH:MM:SS
            tiempo_efectivo_minutos: tiempoEfectivoMinutos ? parseInt(tiempoEfectivoMinutos, 10) : 0,
            pausas: pausas ? parseInt(pausas, 10) : 0
        };

        try {
            await fetchApi('/sesiones/registrar', {
                method: 'POST',
                body: JSON.stringify(datosDeSesion)
            });
            
            // Mostrar confirmación y redirigir al historial
            showToast('Evaluación guardada con éxito. ¡Bien hecho!', 'success');
            setTimeout(() => window.location.href = 'detalleSesion.html', 2000);
        
        } catch (e) { 
            if (e instanceof Error) {
                showToast(`Error al guardar la evaluación: ${e.message}`, 'error');
            }
        }
    });
});