// public/ts/serie-ui-manager.ts

import type { Postura } from "./types";

// Un objeto para mantener todas las referencias al DOM en un solo lugar
const UIElements = {
    disponiblesContainer: document.getElementById('lista-posturas-disponibles') as HTMLDivElement,
    previewNombre: document.getElementById('preview-nombre') as HTMLHeadingElement,
    previewImagen: document.getElementById('preview-imagen') as HTMLImageElement,
    previewDescripcion: document.getElementById('preview-descripcion') as HTMLParagraphElement,
    addPosturaBtn: document.getElementById('add-postura-btn') as HTMLButtonElement,
    duracionInput: document.getElementById('duracion-input') as HTMLInputElement,
    serieEnConstruccionList: document.getElementById('lista-serie-construccion') as HTMLUListElement,
    posturasOcultasContainer: document.getElementById('posturas-ocultas-container') as HTMLDivElement,
};

let posturaSeleccionada: Postura | null = null;

/**
 * Muestra la previsualización de una postura seleccionada.
 */
function mostrarPreview(postura: Postura) {
    posturaSeleccionada = postura;
    UIElements.previewNombre.textContent = postura.nombre;
    UIElements.previewImagen.src = postura.fotoUrl;
    UIElements.previewImagen.style.display = 'block';
    UIElements.previewDescripcion.textContent = Array.isArray(postura.descripcion) ? postura.descripcion.join(' ') : postura.descripcion;
    UIElements.addPosturaBtn.disabled = false;
}

/**
 * Maneja el clic en un elemento de la lista de posturas disponibles.
 */
function handlePosturaItemClick(div: HTMLDivElement, postura: Postura) {
    document.querySelectorAll('.postura-disponible-item').forEach(el => el.classList.remove('activo'));
    div.classList.add('activo');
    mostrarPreview(postura);
}

/**
 * Renderiza la lista de posturas disponibles en la UI.
 * @param posturas - Un array de objetos de postura.
 */
export function renderPosturasDisponibles(posturas: Postura[]) {
    UIElements.disponiblesContainer.innerHTML = '';
    if (posturas.length === 0) {
        UIElements.disponiblesContainer.innerHTML = '<p>No hay posturas para esta terapia.</p>';
        return;
    }

    posturas.forEach(postura => {
        const div = document.createElement('div');
        div.textContent = postura.nombre;
        div.className = 'postura-disponible-item';
        div.style.cssText = 'padding: 8px; cursor: pointer; border-radius: 4px;';
        div.addEventListener('click', () => handlePosturaItemClick(div, postura));
        UIElements.disponiblesContainer.appendChild(div);
    });
}

/**
 * Añade una postura a la lista visual de la serie en construcción y a los inputs ocultos.
 */
export function renderSerieConstruccion(id: string, nombre: string, duracion: string) {
    if (document.querySelector(`li[data-id="${id}"]`)) return; // Evita duplicados

    const li = document.createElement('li');
    li.textContent = `${nombre} - ${duracion} min.`;
    li.dataset.id = id;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Quitar';
    removeBtn.type = 'button'; // Evita que el botón envíe el formulario
    removeBtn.className = 'btn-secundario';
    removeBtn.style.marginLeft = '10px';
    removeBtn.onclick = () => {
        li.remove();
        document.querySelector(`input[name="posturas[]"][value="${id}"]`)?.remove();
        document.querySelector(`input[name="duracion[]"][data-id="${id}"]`)?.remove();
    };
    li.appendChild(removeBtn);
    UIElements.serieEnConstruccionList.appendChild(li);

    const hiddenIdInput = document.createElement('input');
    hiddenIdInput.type = 'hidden';
    hiddenIdInput.name = 'posturas[]';
    hiddenIdInput.value = id;

    const hiddenDuracionInput = document.createElement('input');
    hiddenDuracionInput.type = 'hidden';
    hiddenDuracionInput.name = 'duracion[]';
    hiddenDuracionInput.value = duracion;
    hiddenDuracionInput.dataset.id = id;
    UIElements.posturasOcultasContainer.append(hiddenIdInput, hiddenDuracionInput);
}

/**
 * Configura el event listener para el botón "Añadir a la serie".
 */
export function setupAddPosturaButton() {
    UIElements.addPosturaBtn.addEventListener('click', () => {
        if (posturaSeleccionada && UIElements.duracionInput.value) {
            renderSerieConstruccion(posturaSeleccionada.id, posturaSeleccionada.nombre, UIElements.duracionInput.value);
        }
    });
}