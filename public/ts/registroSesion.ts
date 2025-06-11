import { fetchApi } from "./api";
import { showToast } from "./utils";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dolorFinal = (document.querySelector<HTMLSelectElement>('#dolorFinal'))?.value;
        const comentario = (document.querySelector<HTMLTextAreaElement>('#comentario'))?.value;
        if (!dolorFinal || !comentario) return showToast('Por favor, completa todos los campos.', 'error');

        try {
            await fetchApi('/sesiones/registrar', {
                method: 'POST',
                body: JSON.stringify({ dolorInicio: parseInt(dolorInicio!, 10), dolorFin: parseInt(dolorFinal, 10), comentario })
            });
            showToast('Sesión registrada correctamente', 'success');
            window.location.href = 'detalleSesion.html'; // Redirigir al historial del paciente
        } catch (e) { if (e instanceof Error) showToast(`Error: ${e.message}`, 'error'); }
    });
});