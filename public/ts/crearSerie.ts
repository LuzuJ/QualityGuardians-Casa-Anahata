import { fetchApi } from "./api";
import type { Postura } from "./types";
import { verificarAutenticacion, cerrarSesion, showToast } from "./utils";
import { renderPosturasDisponibles, setupAddPosturaButton } from "./serie-ui-manager";

/**
 * Script para la página de creación de series de ejercicios
 * @description Maneja la interfaz para que los instructores creen series personalizadas de posturas de yoga/ejercicios
 */

/**
 * Inicializa la página de creación de series
 * @description Configura la autenticación, elementos del DOM, y manejadores de eventos para crear series
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar que el usuario esté autenticado como instructor
    verificarAutenticacion();
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    // Obtener referencias a los elementos del formulario y UI
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const tipoTerapiaSelect = document.querySelector<HTMLSelectElement>('#tipoTerapia');
    const selectorVisualContainer = document.querySelector<HTMLDivElement>('#selector-posturas-visual');
    const serieEnConstruccionList = document.querySelector<HTMLUListElement>('#lista-serie-construccion');
    const posturasOcultasContainer = document.querySelector<HTMLDivElement>('#posturas-ocultas-container');

    // Verificar que todos los elementos existan antes de continuar
    if (!form || !tipoTerapiaSelect || !selectorVisualContainer || !serieEnConstruccionList || !posturasOcultasContainer) return;

    // Configurar el botón de "Añadir postura" usando el módulo UI manager
    setupAddPosturaButton();

    /**
     * Manejador para el cambio de tipo de terapia
     * @description Carga las posturas disponibles según el tipo de terapia seleccionado
     */
    tipoTerapiaSelect.addEventListener('change', async () => {
        const terapia = tipoTerapiaSelect.value;
        
        // Mostrar/ocultar selector visual según la selección
        selectorVisualContainer.style.display = terapia ? 'flex' : 'none';
        if (!terapia) return;

        try {
            // Cargar posturas filtradas por tipo de terapia
            const posturas = await fetchApi<Postura[]>(`/posturas?tipoTerapia=${terapia}`);
            renderPosturasDisponibles(posturas);
        } catch (error) {
            if (error instanceof Error) showToast(error.message, 'error');
        }
    });

    /**
     * Manejador del formulario de creación de serie
     * @description Procesa los datos del formulario y crea una nueva serie con las posturas seleccionadas
     * @param {Event} e - Evento de submit del formulario
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar que se haya añadido al menos una postura
        if (serieEnConstruccionList.children.length === 0) {
            showToast('Debes añadir al menos una postura a la serie.', 'error');
            return;
        }

        const formData = new FormData(form);
        
        // Construir secuencia de posturas con sus duraciones
        const secuencia = (formData.getAll('posturas[]') as string[]).map((id, index) => ({
            idPostura: id,
            duracionMinutos: parseInt(formData.getAll('duracion[]')[index] as string, 10)
        }));
        
        // Preparar objeto de datos de la serie
        const datosSerie = {
            nombre: formData.get('nombreSerie') as string,
            tipoTerapia: formData.get('tipoTerapia') as string,
            sesionesRecomendadas: parseInt(formData.get('numSesiones') as string, 10),
            posturas: secuencia
        };
        
        try {
            // Enviar petición para crear la serie
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