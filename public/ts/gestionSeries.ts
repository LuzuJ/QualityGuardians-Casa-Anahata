import { fetchApi, showToast } from './api';
import type { Serie } from './types';

document.addEventListener('DOMContentLoaded', async () => {
    const seriesListUl = document.querySelector<HTMLUListElement>('#lista-series');

    if (!seriesListUl) return;

    try {
        // 1. Obtener todas las series del backend
        const series = await fetchApi<Serie[]>('/series');
        seriesListUl.innerHTML = ''; // Limpiar la lista por si acaso

        if (series.length === 0) {
            seriesListUl.innerHTML = '<p>Aún no has creado ninguna serie.</p>';
            return;
        }

        // 2. Recorrer cada serie y crear un elemento en la lista
        series.forEach(serie => {
            const li = document.createElement('li');
            li.textContent = `${serie.nombre} - (${serie.tipoTerapia}) `;
            li.style.marginBottom = '10px';

            // 3. Crear el botón de "Editar" para cada serie
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'btn-primario';
            editButton.style.marginLeft = '15px';
            editButton.onclick = () => {
                window.location.href = `editarSerie.html?id=${serie.id}`;
            };
            
            li.appendChild(editButton);
            seriesListUl.appendChild(li);
        });

    } catch (error) {
        if (error instanceof Error) {
            showToast(`Error al cargar las series: ${error.message}`, 'error');
        }
    }
});