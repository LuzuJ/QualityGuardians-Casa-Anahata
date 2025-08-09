import { fetchApi, showToast } from "./api";
import type { Postura } from "./types";
import { verificarAutenticacion, cerrarSesion } from "./utils";
import { renderPosturasDisponibles, setupAddPosturaButton } from "./serie-ui-manager";

document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion();
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const form = document.querySelector<HTMLFormElement>('.formulario');
    const tipoTerapiaSelect = document.querySelector<HTMLSelectElement>('#tipoTerapia');
    const selectorVisualContainer = document.querySelector<HTMLDivElement>('#selector-posturas-visual');
    const serieEnConstruccionList = document.querySelector<HTMLUListElement>('#lista-serie-construccion');
    const posturasOcultasContainer = document.querySelector<HTMLDivElement>('#posturas-ocultas-container');

    if (!form || !tipoTerapiaSelect || !selectorVisualContainer || !serieEnConstruccionList || !posturasOcultasContainer) return;

    // Configura el botón de "Añadir" usando el módulo
    setupAddPosturaButton();

    // Lógica para cargar las posturas al cambiar la terapia
    tipoTerapiaSelect.addEventListener('change', async () => {
        const terapia = tipoTerapiaSelect.value;
        selectorVisualContainer.style.display = terapia ? 'flex' : 'none';
        if (!terapia) return;

        try {
            const posturas = await fetchApi<Postura[]>(`/posturas?tipoTerapia=${terapia}`);
            renderPosturasDisponibles(posturas);
        } catch (error) {
            if (error instanceof Error) showToast(error.message, 'error');
        }
    });

    // Lógica para enviar el formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (serieEnConstruccionList.children.length === 0) {
            showToast('Debes añadir al menos una postura a la serie.', 'error');
            return;
        }

        const formData = new FormData(form);
        const secuencia = (formData.getAll('posturas[]') as string[]).map((id, index) => ({
            idPostura: id,
            duracionMinutos: parseInt(formData.getAll('duracion[]')[index] as string, 10)
        }));
        
        const datosSerie = {
            nombre: formData.get('nombreSerie') as string,
            tipoTerapia: formData.get('tipoTerapia') as string,
            sesionesRecomendadas: parseInt(formData.get('numSesiones') as string, 10),
            posturas: secuencia
        };
        
        try {
            await fetchApi('/series', { method: 'POST', body: JSON.stringify(datosSerie) });
            showToast('Serie creada con éxito', 'success');
            form.reset();
            serieEnConstruccionList.innerHTML = '';
            posturasOcultasContainer.innerHTML = '';
        } catch (error) {
            if (error instanceof Error) showToast(`Error: ${error.message}`, 'error');
        }
    });
});