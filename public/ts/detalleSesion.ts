import { fetchApi } from "./api";
import type { Sesion } from "./types"; 
import { verificarAutenticacion, cerrarSesion, showToast } from "./utils";

/**
 * Script para la página de detalle de sesiones
 * @description Maneja la visualización del historial de sesiones, tanto para instructores (viendo pacientes específicos) como para pacientes (viendo su propio historial)
 */

/**
 * Inicializa la página de detalle de sesiones
 * @description Configura la autenticación, determina el tipo de usuario y carga el historial correspondiente
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    // Obtener contenedor principal donde se mostrará el historial
    const container = document.querySelector<HTMLDivElement>('.contenido-panel .tarjeta');
    if (!container) return;

    // Determinar si se está viendo el historial de un paciente específico o el propio
    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('pacienteId');

    // Construir endpoint según el contexto (instructor viendo paciente vs paciente viendo su historial)
    const endpoint = pacienteId ? `/pacientes/${pacienteId}/historial` : '/pacientes/mi-historial';

    try {
        // Obtener historial de sesiones desde el servidor
        const historial = await fetchApi<Sesion[]>(endpoint);
        
        // Preservar el título original del contenedor
        const titulo = container.querySelector('h2')?.outerHTML || '';
        
        // Limpiar contenedor y restaurar título
        container.innerHTML = titulo; 
        
        // Manejar caso de historial vacío
        if (historial.length === 0) {
            container.innerHTML += '<p>Aún no hay sesiones registradas.</p>';
        } else {
            // Crear lista para mostrar el historial de forma organizada
            const ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';

            // Renderizar cada sesión del historial
            historial.forEach(sesion => {
                const li = document.createElement('li');
                li.className = 'tarjeta'; 
                li.style.marginTop = '1rem';
                li.style.padding = '1rem';

                const fecha = new Date(sesion.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
        container.innerHTML = '<p>No se pudo cargar el historial. Por favor, intenta de nuevo.</p>';
        if (e instanceof Error) {
            showToast(e.message, 'error');
        }
    }
});