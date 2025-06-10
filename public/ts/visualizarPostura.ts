import { fetchApi } from "./api";
import type { Postura } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector<HTMLDivElement>('.tarjeta');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const posturaId = urlParams.get('posturaId');

    if (!posturaId) return container.innerHTML = '<h2>Error: No se especificó postura.</h2>';

    try {
        const postura = await fetchApi<Postura>(`/posturas/${posturaId}`);
        container.querySelector('p:nth-of-type(1)')!.innerHTML = `<strong>Nombre:</strong> ${postura.nombreEspanol} (${postura.nombreSanskrito || ''})`;
        container.querySelector('p:nth-of-type(2)')!.innerHTML = `<strong>Beneficios:</strong> ${postura.beneficios}`;
        container.querySelector('p:nth-of-type(3)')!.innerHTML = `<strong>Instrucciones:</strong> ${postura.instrucciones}`;
        const video = container.querySelector<HTMLVideoElement>('video');
        if (video) {
            const source = video.querySelector('source');
            if (source) source.src = postura.videoUrl;
            video.load();
        }
    } catch (e) { if (e instanceof Error) alert(e.message); }
});