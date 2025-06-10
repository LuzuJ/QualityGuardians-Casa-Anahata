import { fetchApi } from "./api";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dolorFinal = (document.querySelector<HTMLSelectElement>('#dolorFinal'))?.value;
        const comentario = (document.querySelector<HTMLTextAreaElement>('#comentario'))?.value;
        if (!dolorFinal || !comentario) return alert('Completa todos los campos.');

        try {
            await fetchApi('/sesiones/registrar', {
                method: 'POST',
                body: JSON.stringify({ dolorInicio: parseInt(dolorInicio!, 10), dolorFin: parseInt(dolorFinal, 10), comentario })
            });
            alert('Evaluación guardada con éxito.');
            window.location.href = 'detalleSesion.html'; // Redirigir al historial del paciente
        } catch (e) { if (e instanceof Error) alert(e.message); }
    });
});