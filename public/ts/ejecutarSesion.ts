// public/ts/ejecutarSesion.ts

import { fetchApi, showToast } from './api';
import type { Paciente } from './types'; // Importamos el tipo Paciente

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const progresoEl = document.querySelector<HTMLDivElement>('#progreso-sesiones');

    if (!progresoEl) return;

    // --- NUEVA LÓGICA PARA CARGAR EL PROGRESO ---
    try {
        // Pedimos al backend los datos del paciente que ha iniciado sesión
        const paciente = await fetchApi<Paciente>('/pacientes/mi-perfil'); // <-- Necesitamos crear este endpoint

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
    // --- FIN DE LA NUEVA LÓGICA ---

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const dolorInicio = (document.querySelector<HTMLSelectElement>('#dolorInicio'))?.value;
        if (!dolorInicio) {
            return showToast('Selecciona tu nivel de molestia.', 'error');
        }
        window.location.href = `ejecucionSerie.html?dolorInicio=${dolorInicio}`;
    });
});