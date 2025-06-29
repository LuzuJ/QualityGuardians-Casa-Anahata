// public/ts/detalleSesion.ts

import { fetchApi, showToast } from "./api";
import type { Sesion } from "./types"; // Asegúrate de que la interfaz Sesion esté en types.ts

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector<HTMLDivElement>('.contenido-panel .tarjeta');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('pacienteId');

    const endpoint = pacienteId ? `/pacientes/${pacienteId}/historial` : '/pacientes/mi-historial';

    try {
        const historial = await fetchApi<Sesion[]>(endpoint);
        const titulo = container.querySelector('h2')?.outerHTML || '';
        
        // Limpiamos el contenedor y volvemos a poner el título
        container.innerHTML = titulo; 
        
        if (historial.length === 0) {
            container.innerHTML += '<p>Aún no hay sesiones registradas.</p>';
        } else {
            // Creamos una lista para mostrar el historial de forma ordenada
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';

            historial.forEach(sesion => {
                const li = document.createElement('li');
                li.className = 'tarjeta'; // Reutilizamos el estilo de tarjeta para cada item
                li.style.marginTop = '1rem';
                li.style.padding = '1rem';

                const fecha = new Date(sesion.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

                // --- LÍNEAS CORREGIDAS ---
                // Usamos 'dolorInicial' y 'dolorFinal' para que coincida con la base de datos
                li.innerHTML = `
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p><strong>Intensidad inicial:</strong> ${sesion.dolorInicial} / 4</p>
                    <p><strong>Intensidad final:</strong> ${sesion.dolorFinal} / 4</p>
                    <p><strong>Comentario:</strong> ${sesion.comentario || 'N/A'}</p>
                `;
                ul.appendChild(li);
            });
            container.appendChild(ul);
        }
    } catch (e) { 
        if (e instanceof Error) {
            showToast(e.message, 'error');
        }
    }
});