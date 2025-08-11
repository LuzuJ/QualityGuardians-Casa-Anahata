import { fetchApi } from './api';
import type { Serie } from './types';
import { verificarAutenticacion, cerrarSesion, showToast } from './utils';

/**
 * Script para la página de gestión de series de ejercicios
 * @description Maneja la interfaz donde los instructores pueden visualizar y administrar sus series creadas
 */

/**
 * Inicialización del script de gestión de series
 * @description Event listener principal que configura la funcionalidad de visualización y gestión de series
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const seriesListUl = document.querySelector<HTMLUListElement>('#lista-series');

    if (!seriesListUl) return;

    try {
        // Obtener todas las series del instructor desde la API
        const series = await fetchApi<Serie[]>('/series');
        
        seriesListUl.innerHTML = '';

        if (series.length === 0) {
            seriesListUl.innerHTML = '<p>Aún no has creado ninguna serie.</p>';
            return;
        }

        series.forEach(serie => {
            // Crear elemento de lista para la serie
            const li = document.createElement('li');
            li.textContent = `${serie.nombre} - (${serie.tipoTerapia}) `;
            li.style.marginBottom = '10px';

            // Crear botón de edición para la serie
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'btn-primario';
            editButton.style.marginLeft = '15px';
            editButton.onclick = () => {
                window.location.href = `editarSerie.html?id=${serie.id}`;
            };
            
            // Agregar botón al elemento de lista y lista al contenedor
            li.appendChild(editButton);
            seriesListUl.appendChild(li);
        });

    } catch (error) {
        seriesListUl.innerHTML = '<li>Error al cargar las series. Intenta de nuevo.</li>';
        if (error instanceof Error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    }
});