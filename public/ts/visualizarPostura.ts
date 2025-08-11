import { fetchApi } from "./api";
import type { Postura } from "./types";
import { verificarAutenticacion, cerrarSesion, showToast } from "./utils";

/**
 * Script para la página de visualización detallada de posturas de yoga
 * @description Muestra información completa de una postura incluyendo video instructivo de YouTube
 */

/**
 * Extrae el ID de un video de YouTube desde varios formatos de URL
 * @description Función utilitaria que maneja diferentes formatos de URLs de YouTube
 * @param {string} url - La URL del video de YouTube a procesar
 * @returns {string | null} El ID del video de 11 caracteres o null si no es válido
 * @example
 * getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // returns 'dQw4w9WgXcQ'
 * getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ') // returns 'dQw4w9WgXcQ'
 */
function getYouTubeVideoId(url: string): string | null {
    // Verificar que la URL existe
    if (!url) return null;
    
    // Expresión regular que maneja múltiples formatos de URLs de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    // Validar que el ID tenga exactamente 11 caracteres (estándar de YouTube)
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Inicialización del script de visualización de postura
 * @description Event listener principal que carga y muestra los detalles completos de una postura
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const urlParams = new URLSearchParams(window.location.search);
    const posturaId = urlParams.get('posturaId');

    if (!posturaId) {
        showToast('Error: No se especificó ninguna postura.', 'error');
        return;
    }

    try {
        // Cargar información completa de la postura desde la API
        const postura = await fetchApi<Postura>(`/posturas/${posturaId}`);

        // Actualizar elementos de información básica de la postura
        document.getElementById('postura-nombre')!.textContent = postura.nombre;
        document.getElementById('postura-sanskrito')!.textContent = postura.nombreSanskrito || 'No disponible';
        
        // Renderizar beneficios manejando tanto arrays como strings
        document.getElementById('postura-beneficios')!.innerHTML = Array.isArray(postura.beneficios) 
            ? postura.beneficios.join('<br>') 
            : postura.beneficios;
            
        // Renderizar instrucciones/descripción manejando tanto arrays como strings
        document.getElementById('postura-instrucciones')!.innerHTML = Array.isArray(postura.descripcion)
            ? postura.descripcion.join('<br>')
            : postura.descripcion;

        // Configurar video instructivo de YouTube
        const iframeElement = document.getElementById('youtube-video') as HTMLIFrameElement;
        const videoContainer = iframeElement?.parentElement as HTMLElement;

        if (iframeElement && videoContainer) {
            // Extraer ID del video desde la URL proporcionada
            const videoId = getYouTubeVideoId(postura.videoUrl);

            if (videoId) {
                // Configurar iframe con URL de embed de YouTube
                iframeElement.src = `https://www.youtube.com/embed/${videoId}`;
                videoContainer.style.display = 'block'; // Mostrar contenedor del video
            } else {
                // Ocultar video si no hay URL válida
                videoContainer.style.display = 'none';
                console.warn("No se encontró un ID de video de YouTube válido en la URL:", postura.videoUrl);
            }
        }

    } catch (e) {
        if (e instanceof Error) {
            showToast(`Error al cargar la postura: ${e.message}`, 'error');
        }
    }
});