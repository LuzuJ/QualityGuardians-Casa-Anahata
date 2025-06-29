import { fetchApi, showToast } from "./api";
import type { Postura } from "./types";

/**
 * Función mejorada para extraer el ID de un video de YouTube desde varios formatos de URL.
 * @param url - La URL del video de YouTube.
 * @returns El ID del video o null si no se encuentra.
 */
function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const posturaId = urlParams.get('posturaId');

    if (!posturaId) {
        showToast('Error: No se especificó ninguna postura.', 'error');
        return;
    }

    try {
        const postura = await fetchApi<Postura>(`/posturas/${posturaId}`);

        document.getElementById('postura-nombre')!.textContent = postura.nombre;
        document.getElementById('postura-sanskrito')!.textContent = postura.nombreSanskrito || 'No disponible';
        
        // Aseguramos que los datos sean arrays antes de usar .join()
        document.getElementById('postura-beneficios')!.innerHTML = Array.isArray(postura.beneficios) 
            ? postura.beneficios.join('<br>') 
            : postura.beneficios;
            
        document.getElementById('postura-instrucciones')!.innerHTML = Array.isArray(postura.descripcion)
            ? postura.descripcion.join('<br>')
            : postura.descripcion;

        // --- LÓGICA DE VIDEO CORREGIDA Y MEJORADA ---
        const iframeElement = document.getElementById('youtube-video') as HTMLIFrameElement;
        const videoContainer = iframeElement?.parentElement as HTMLElement;

        if (iframeElement && videoContainer) {
            const videoId = getYouTubeVideoId(postura.videoUrl);

            if (videoId) {
                // Usamos la URL de 'embed' correcta de YouTube
                iframeElement.src = `https://www.youtube.com/embed/${videoId}`;
                videoContainer.style.display = 'block'; // Mostramos el contenedor
            } else {
                // Si no hay videoId válido, ocultamos el contenedor del video
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