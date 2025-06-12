import { fetchApi } from "./api";
import { showToast } from "./utils";
import type { Postura } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    // Obtenemos el ID de la postura desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const posturaId = urlParams.get('posturaId');

    if (!posturaId) {
        showToast('Error: No se especificó ninguna postura.', 'error');
        return;
    }

    try {
        // Hacemos la llamada a la API para obtener los detalles de la postura
        const postura = await fetchApi<Postura>(`/posturas/${posturaId}`);

        // Usamos los IDs para actualizar el HTML con los datos correctos
        document.getElementById('postura-nombre')!.textContent = postura.nombre;
        document.getElementById('postura-sanskrito')!.textContent = postura.nombreSanskrito || 'No disponible';
        
        // Unimos los arrays con saltos de línea para mejor visualización
        document.getElementById('postura-beneficios')!.innerHTML = postura.beneficios.join('<br>');
        document.getElementById('postura-instrucciones')!.innerHTML = postura.instrucciones.join('<br>');

        const iframeElement = document.getElementById('youtube-video') as HTMLIFrameElement;
        if (iframeElement && postura.videoUrl) {
          let videoId = '';
          try {
            // Extraemos el ID del video del enlace corto (ej. https://youtu.be/VIDEO_ID)
            const url = new URL(postura.videoUrl);
            if (url.hostname === 'youtu.be') {
              videoId = url.pathname.substring(1);
            }
          } catch (e) {
            console.error("La URL del video no es válida:", postura.videoUrl);
          }
        
          // Si logramos obtener un ID, construimos la URL para incrustar
          if (videoId) {
            iframeElement.src = `https://www.youtube.com/embed/${videoId}`;
          } else {
            // Si no hay un ID de video válido, ocultamos el contenedor del video
            (iframeElement.parentElement as HTMLElement).style.display = 'none';
          }
        } else if (iframeElement) {
          // Si la postura no tiene videoUrl, también ocultamos el contenedor
          (iframeElement.parentElement as HTMLElement).style.display = 'none';
        }

    } catch (e) {
        if (e instanceof Error) {
            showToast(`Error al cargar la postura: ${e.message}`, 'error');
        }
    }
});