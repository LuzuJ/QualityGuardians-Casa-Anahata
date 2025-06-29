import { fetchApi, showToast } from "./api";
import type { Postura } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    // --- Referencias a elementos del DOM ---
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const tipoTerapiaSelect = document.querySelector<HTMLSelectElement>('#tipoTerapia');
    
    // Elementos del nuevo selector visual
    const selectorVisualContainer = document.querySelector<HTMLDivElement>('#selector-posturas-visual');
    const disponiblesContainer = document.querySelector<HTMLDivElement>('#lista-posturas-disponibles');
    
    // Elementos de la previsualización
    const previewNombre = document.querySelector<HTMLHeadingElement>('#preview-nombre');
    const previewImagen = document.querySelector<HTMLImageElement>('#preview-imagen');
    const previewDescripcion = document.querySelector<HTMLParagraphElement>('#preview-descripcion');
    
    // Botones de acción y listas
    const addPosturaBtn = document.querySelector<HTMLButtonElement>('#add-postura-btn');
    const duracionInput = document.querySelector<HTMLInputElement>('#duracion-input');
    const serieEnConstruccionList = document.querySelector<HTMLUListElement>('#lista-serie-construccion');
    const posturasOcultasContainer = document.querySelector<HTMLDivElement>('#posturas-ocultas-container');

    if (!form || !tipoTerapiaSelect || !selectorVisualContainer || !disponiblesContainer || !previewNombre || !previewImagen || !previewDescripcion || !addPosturaBtn || !duracionInput || !serieEnConstruccionList || !posturasOcultasContainer) return;

    let posturasDisponibles: Postura[] = [];
    let posturaSeleccionada: Postura | null = null;

    // --- LÓGICA PRINCIPAL ---

    // 1. Cuando el instructor selecciona un tipo de terapia...
    tipoTerapiaSelect.addEventListener('change', async () => {
        const terapia = tipoTerapiaSelect.value;
        if (!terapia) {
            selectorVisualContainer.style.display = 'none';
            return;
        }

        // ...hacemos una llamada al backend para traer solo las posturas de esa terapia
        try {
            disponiblesContainer.innerHTML = '<p>Cargando posturas...</p>';
            posturasDisponibles = await fetchApi<Postura[]>(`/posturas?tipoTerapia=${terapia}`);
            selectorVisualContainer.style.display = 'flex';
            renderPosturasDisponibles();
        } catch (error) {
            if (error instanceof Error) showToast(error.message, 'error');
        }
    });

    // 2. Función para renderizar la lista de posturas disponibles
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

            // Cuando se hace clic en una postura, se muestra en la previsualización
            div.addEventListener('click', () => {
                document.querySelectorAll('.postura-disponible-item').forEach(el => el.classList.remove('activo'));
                div.classList.add('activo');
                mostrarPreview(postura);
            });
            disponiblesContainer.appendChild(div);
        });
    };

    // 3. Función para mostrar la postura seleccionada en el área de preview
    const mostrarPreview = (postura: Postura) => {
        posturaSeleccionada = postura;
        previewNombre.textContent = postura.nombre;
        previewImagen.src = postura.fotoUrl;
        previewImagen.style.display = 'block';
        previewDescripcion.textContent = postura.descripcion.join(' ');
        addPosturaBtn.disabled = false;
    };
    
    // 4. Cuando se pulsa el botón "Añadir a la Serie"
    addPosturaBtn.addEventListener('click', () => {
        if (!posturaSeleccionada) return;

        const id = posturaSeleccionada.id;
        const nombre = posturaSeleccionada.nombre;
        const duracion = duracionInput.value;

        // Añadir a la lista visual
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

        // Añadir a los campos ocultos que se enviarán con el formulario
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
    });


    // 5. Envío final del formulario
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