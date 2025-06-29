// public/ts/registroSesion.ts

import { fetchApi } from "./api";
import { showToast } from "./utils";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const horaInicio = urlParams.get('horaInicio');
    const horaFin = urlParams.get('horaFin');
    const tiempoEfectivoMinutos = urlParams.get('tiempoEfectivoMinutos');
    const pausas = urlParams.get('pausas');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dolorFinal = (document.querySelector<HTMLSelectElement>('#dolorFinal'))?.value;
        const comentario = (document.querySelector<HTMLTextAreaElement>('#comentario'))?.value;

        if (!dolorFinal || !comentario) {
            return showToast('Por favor, completa todos los campos.', 'error');
        }

        // --- OBJETO DE DATOS CORREGIDO ---
        // Ahora las claves coinciden con las que espera tu backend (snake_case)
        const datosDeSesion = {
            dolorInicial: dolorInicio ? parseInt(dolorInicio, 10) : null,
            dolorFinal: parseInt(dolorFinal, 10),
            comentario: comentario,
            hora_inicio: horaInicio || null, // Corregido
            hora_fin: horaFin || null, // Corregido
            tiempo_efectivo_minutos: tiempoEfectivoMinutos ? parseInt(tiempoEfectivoMinutos, 10) : null, // Corregido
            pausas: pausas ? parseInt(pausas, 10) : null
        };

        try {
            await fetchApi('/sesiones/registrar', {
                method: 'POST',
                body: JSON.stringify(datosDeSesion)
            });
            
            showToast('Sesión registrada correctamente. ¡Bien hecho!', 'success');
            setTimeout(() => window.location.href = 'detalleSesion.html', 2000);
        
        } catch (e) { 
            if (e instanceof Error) {
                showToast(`Error al registrar la sesión: ${e.message}`, 'error');
            }
        }
    });
});