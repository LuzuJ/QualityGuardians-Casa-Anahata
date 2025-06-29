import { fetchApi } from "./api";
import { showToast } from "./utils";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    
    // --- LEEMOS TODOS LOS PARÁMETROS DE LA URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const horaInicio = urlParams.get('horaInicio');
    const horaFin = urlParams.get('horaFin');
    const tiempoEfectivoMinutos = urlParams.get('tiempoEfectivoMinutos');
    const pausas = urlParams.get('pausas');

    // Verificación inicial para asegurar que los datos esenciales llegaron
    if (!dolorInicio || !horaInicio || !horaFin) {
        showToast('Faltan datos de la sesión anterior. No se puede registrar la evaluación.', 'error');
        return;
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dolorFinal = (document.querySelector<HTMLSelectElement>('#dolorFinal'))?.value;
        const comentario = (document.querySelector<HTMLTextAreaElement>('#comentario'))?.value;

        if (!dolorFinal || !comentario) {
            return showToast('Por favor, completa todos los campos.', 'error');
        }

        // --- CONSTRUIMOS EL OBJETO CON TODOS LOS DATOS V2 ---
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
            
            showToast('Evaluación guardada con éxito. ¡Bien hecho!', 'success');
            setTimeout(() => window.location.href = 'detalleSesion.html', 2000);
        
        } catch (e) { 
            if (e instanceof Error) {
                showToast(`Error al guardar la evaluación: ${e.message}`, 'error');
            }
        }
    });
});