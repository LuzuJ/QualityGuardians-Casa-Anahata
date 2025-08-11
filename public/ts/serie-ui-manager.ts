import type { Postura } from "./types";

/**
 * Módulo de gestión de interfaz para creación y edición de series
 * @description Maneja la interfaz de usuario para selección de posturas y construcción de series de ejercicios
 */

/**
 * Objeto centralizado con referencias a elementos del DOM
 * @description Mantiene todas las referencias DOM en un solo lugar para mejor organización
 */
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

// Variable de estado para mantener la postura actualmente seleccionada
let posturaSeleccionada: Postura | null = null;

/**
 * Muestra la previsualización de una postura seleccionada
 * @description Actualiza el panel de preview con los detalles de la postura y habilita el botón de agregar
 * @param {Postura} postura - Objeto con los datos de la postura a previsualizar
 */
function mostrarPreview(postura: Postura) {
    // Establecer la postura como seleccionada
    posturaSeleccionada = postura;
    
    // Actualizar elementos del preview con datos de la postura
    UIElements.previewNombre.textContent = postura.nombre;
    UIElements.previewImagen.src = postura.fotoUrl;
    UIElements.previewImagen.style.display = 'block';
    UIElements.previewDescripcion.textContent = Array.isArray(postura.descripcion) ? postura.descripcion.join(' ') : postura.descripcion;
    
    UIElements.addPosturaBtn.disabled = false;
}

/**
 * Maneja el clic en un elemento de la lista de posturas disponibles
 * @description Actualiza la selección visual y muestra el preview de la postura clickeada
 * @param {HTMLDivElement} div - Elemento DOM clickeado
 * @param {Postura} postura - Datos de la postura asociada al elemento
 */
function handlePosturaItemClick(div: HTMLDivElement, postura: Postura) {
    document.querySelectorAll('.postura-disponible-item').forEach(el => el.classList.remove('activo'));
    
    div.classList.add('activo');
    
    mostrarPreview(postura);
}

/**
 * Renderiza la lista de posturas disponibles en la interfaz de usuario
 * @description Crea elementos interactivos para cada postura disponible según el tipo de terapia
 * @param {Postura[]} posturas - Array de objetos de postura a mostrar
 * @exported Función exportada para uso en otros módulos
 */
export function renderPosturasDisponibles(posturas: Postura[]) {
    UIElements.disponiblesContainer.innerHTML = '';
    
    if (posturas.length === 0) {
        UIElements.disponiblesContainer.innerHTML = '<p>No hay posturas para esta terapia.</p>';
        return;
    }

    // Crear elemento interactivo para cada postura
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
 * Añade una postura a la serie en construcción
 * @description Agrega postura tanto a la lista visual como a los inputs ocultos del formulario
 * @param {string} id - ID único de la postura
 * @param {string} nombre - Nombre descriptivo de la postura
 * @param {string} duracion - Duración en minutos para la postura
 * @exported Función exportada para uso en otros módulos
 */
export function renderSerieConstruccion(id: string, nombre: string, duracion: string) {
    // Prevenir duplicados verificando si ya existe la postura
    if (document.querySelector(`li[data-id="${id}"]`)) return;

    const li = document.createElement('li');
    li.textContent = `${nombre} - ${duracion} min.`;
    li.dataset.id = id;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Quitar';
    removeBtn.type = 'button'; // Evitar envío accidental del formulario
    removeBtn.className = 'btn-secundario';
    removeBtn.style.marginLeft = '10px';
    removeBtn.onclick = () => {
        // Remover elemento visual y inputs ocultos asociados
        li.remove();
        document.querySelector(`input[name="posturas[]"][value="${id}"]`)?.remove();
        document.querySelector(`input[name="duracion[]"][data-id="${id}"]`)?.remove();
    };
    
    li.appendChild(removeBtn);
    UIElements.serieEnConstruccionList.appendChild(li);

    // Crear inputs ocultos para envío del formulario
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
 * Configura el event listener para el botón "Añadir a la serie"
 * @description Inicializa la funcionalidad de agregar posturas seleccionadas a la serie en construcción
 * @exported Función exportada para uso en otros módulos
 */
export function setupAddPosturaButton() {
    UIElements.addPosturaBtn.addEventListener('click', () => {
        // Verificar que hay una postura seleccionada y duración especificada
        if (posturaSeleccionada && UIElements.duracionInput.value) {
            // Agregar postura a la serie en construcción
            renderSerieConstruccion(posturaSeleccionada.id, posturaSeleccionada.nombre, UIElements.duracionInput.value);
        }
    });
}