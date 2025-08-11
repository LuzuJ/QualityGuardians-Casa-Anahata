import { fetchApi } from "./api";
import type { Postura, Serie } from "./types";
import { verificarAutenticacion, cerrarSesion, showToast } from "./utils";

/**
 * Script para la página de edición de series de ejercicios
 * @description Maneja la interfaz para que los instructores editen series existentes, permitiendo modificar nombre, tipo de terapia, sesiones recomendadas y posturas
 */

/**
 * Inicializa la página de edición de series
 * @description Configura la autenticación, carga los datos de la serie a editar y establece los manejadores de eventos
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const form = document.querySelector<HTMLFormElement>('.formulario');
    const nombreInput = document.querySelector<HTMLInputElement>('#nombreSerie');
    const tipoTerapiaSelect = document.querySelector<HTMLSelectElement>('#tipoTerapia');
    const sesionesInput = document.querySelector<HTMLInputElement>('#numSesiones');
    const disponiblesContainer = document.querySelector<HTMLDivElement>('#lista-posturas-disponibles');
    const previewNombre = document.querySelector<HTMLHeadingElement>('#preview-nombre');
    const previewImagen = document.querySelector<HTMLImageElement>('#preview-imagen');
    const previewDescripcion = document.querySelector<HTMLParagraphElement>('#preview-descripcion');
    const addPosturaBtn = document.querySelector<HTMLButtonElement>('#add-postura-btn');
    const duracionInput = document.querySelector<HTMLInputElement>('#duracion-input');
    const serieEnConstruccionList = document.querySelector<HTMLUListElement>('#lista-serie-construccion');
    const posturasOcultasContainer = document.querySelector<HTMLDivElement>('#posturas-ocultas-container');

    if (!form || !nombreInput || !tipoTerapiaSelect || !sesionesInput || !disponiblesContainer || !previewNombre || !previewImagen || !previewDescripcion || !addPosturaBtn || !duracionInput || !serieEnConstruccionList || !posturasOcultasContainer) {
        return;
    }

    // Variables de estado para manejar posturas disponibles y selección actual
    let posturasDisponibles: Postura[] = [];
    let posturaSeleccionada: Postura | null = null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const serieId = urlParams.get('id');

    if (!serieId) {
        showToast('ID de serie no válido.', 'error');
        window.location.href = 'gestionSeries.html';
        return;
    }

    /**
     * Renderiza una postura en la lista de construcción de la serie
     * @description Añade una postura con su duración a la serie en construcción y crea los inputs ocultos necesarios
     * @param {string} id - ID único de la postura
     * @param {string} nombre - Nombre de la postura
     * @param {string} duracion - Duración en minutos de la postura
     */
    const renderSerieConstruccion = (id: string, nombre: string, duracion: string) => {
        // Evitar duplicados en la serie
        if (document.querySelector(`li[data-id="${id}"]`)) return;
        
        const li = document.createElement('li');
        li.textContent = `${nombre} - ${duracion} min.`;
        li.dataset.id = id;
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Quitar';
        removeBtn.className = 'btn-secundario';
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = () => {
            li.remove();
            document.querySelector(`input[name="posturas[]"][value="${id}"]`)?.remove();
            document.querySelector(`input[name="duracion[]"][data-id="${id}"]`)?.remove();
        };
        li.appendChild(removeBtn);
        serieEnConstruccionList.appendChild(li);

        const hiddenIdInput = document.createElement('input');
        hiddenIdInput.type = 'hidden';
        hiddenIdInput.name = 'posturas[]';
        hiddenIdInput.value = id;
        const hiddenDuracionInput = document.createElement('input');
        hiddenDuracionInput.type = 'hidden';
        hiddenDuracionInput.name = 'duracion[]';
        hiddenDuracionInput.value = duracion;
        hiddenDuracionInput.dataset.id = id;
        posturasOcultasContainer.append(hiddenIdInput, hiddenDuracionInput);
    };

    /**
     * Maneja el click en un elemento de postura disponible
     * @description Actualiza la selección visual y muestra el preview de la postura seleccionada
     * @param {HTMLDivElement} div - Elemento DOM de la postura clickeada
     * @param {Postura} postura - Objeto de datos de la postura
     */
    function handlePosturaItemClick(div: HTMLDivElement, postura: Postura) {
        // Remover clase activo de todas las posturas
        document.querySelectorAll('.postura-disponible-item').forEach(el => el.classList.remove('activo'));
        // Marcar la postura actual como activa
        div.classList.add('activo');
        mostrarPreview(postura);
    }

    /**
     * Renderiza la lista de posturas disponibles según el tipo de terapia
     * @description Actualiza el contenedor de posturas disponibles con las posturas filtradas por terapia
     */
    const renderPosturasDisponibles = () => {
        disponiblesContainer.innerHTML = '';
        
        if (posturasDisponibles.length === 0) {
            disponiblesContainer.innerHTML = '<p>No hay posturas para esta terapia.</p>';
            return;
        }
        
        posturasDisponibles.forEach(postura => {
            const div = document.createElement('div');
            div.textContent = postura.nombre;
            div.className = 'postura-disponible-item';
            div.style.padding = '8px';
            div.style.cursor = 'pointer';
            div.style.borderRadius = '4px';
            div.addEventListener('click', () => handlePosturaItemClick(div, postura));
            disponiblesContainer.appendChild(div);
        });
    };

    /**
     * Muestra el preview de una postura seleccionada
     * @description Actualiza la sección de preview con los detalles de la postura y habilita el botón de añadir
     * @param {Postura} postura - Objeto de datos de la postura a mostrar
     */
    const mostrarPreview = (postura: Postura) => {
        posturaSeleccionada = postura;
        previewNombre.textContent = postura.nombre;
        previewImagen.src = postura.fotoUrl;
        previewImagen.style.display = 'block';
        previewDescripcion.textContent = Array.isArray(postura.descripcion) ? postura.descripcion.join(' ') : (postura.descripcion || '');
        addPosturaBtn.disabled = false;
    };

    // Carga de datos inicial: serie a editar y posturas disponibles
    try {
        const serieAEditar = await fetchApi<Serie>(`/series/${serieId}`);
        posturasDisponibles = await fetchApi<Postura[]>(`/posturas?tipoTerapia=${serieAEditar.tipoTerapia}`);
        
        nombreInput.value = serieAEditar.nombre;
        tipoTerapiaSelect.value = serieAEditar.tipoTerapia;
        sesionesInput.value = String(serieAEditar.sesionesRecomendadas);

        renderPosturasDisponibles();

        const todasLasPosturas = await fetchApi<Postura[]>('/posturas');
        serieAEditar.posturas.forEach(p => {
            const posturaInfo = todasLasPosturas.find(post => post.id === p.idPostura);
            if (posturaInfo) {
                renderSerieConstruccion(p.idPostura, posturaInfo.nombre, String(p.duracionMinutos));
            }
        });
    } catch(error) {
        if(error instanceof Error) showToast(`Error al cargar los datos de la serie: ${error.message}`, 'error');
    }

    /**
     * Manejador para el cambio de tipo de terapia
     * @description Recarga las posturas disponibles cuando se cambia el tipo de terapia
     */
    tipoTerapiaSelect.addEventListener('change', async () => {
        const terapia = tipoTerapiaSelect.value;
        if (!terapia) return;
        
        try {
            disponiblesContainer.innerHTML = '<p>Cargando posturas...</p>';
            
            posturasDisponibles = await fetchApi<Postura[]>(`/posturas?tipoTerapia=${terapia}`);
            renderPosturasDisponibles();
        } catch (error) {
            if (error instanceof Error) showToast(error.message, 'error');
        }
    });
    
    /**
     * Manejador para añadir postura a la serie
     * @description Añade la postura seleccionada con su duración a la serie en construcción
     */
    addPosturaBtn.addEventListener('click', () => {
        if (posturaSeleccionada && duracionInput.value) {
            renderSerieConstruccion(posturaSeleccionada.id, posturaSeleccionada.nombre, duracionInput.value);
        }
    });

    /**
     * Manejador del formulario de actualización de serie
     * @description Procesa los datos del formulario y actualiza la serie en el servidor
     * @param {Event} e - Evento de submit del formulario
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validar que la serie tenga al menos una postura
        if (serieEnConstruccionList.children.length === 0) {
            showToast('La serie debe contener al menos una postura.', 'error');
            return;
        }

        const formData = new FormData(form);
        
        const secuencia = (formData.getAll('posturas[]') as string[]).map((id, index) => ({
            idPostura: id,
            duracionMinutos: parseInt(formData.getAll('duracion[]')[index] as string, 10)
        }));
        
        const datosSerieActualizada = {
            nombre: nombreInput.value,
            tipoTerapia: tipoTerapiaSelect.value,
            sesionesRecomendadas: parseInt(sesionesInput.value, 10),
            posturas: secuencia
        };

        try {
            await fetchApi(`/series/${serieId}`, { 
                method: 'PUT',
                body: JSON.stringify(datosSerieActualizada) 
            });
            
            showToast('Serie actualizada con éxito', 'success');
            setTimeout(() => window.location.href = 'gestionSeries.html', 1500);
        } catch (error) {
            if (error instanceof Error) showToast(`Error al actualizar: ${error.message}`, 'error');
        }
    });
});