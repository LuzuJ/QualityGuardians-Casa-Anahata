import { fetchApi } from "./api";
import type { Serie } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    const titulo = document.querySelector<HTMLHeadingElement>('.tarjeta h2');
    const imagen = document.querySelector<HTMLImageElement>('.imagen-postura img');
    const duracionP = document.querySelector<HTMLParagraphElement>('.tarjeta p');
    const btnDetalles = document.querySelector<HTMLAnchorElement>('a[href*="visualizarPosturas.html"]');
    const btnSiguiente = document.querySelector<HTMLAnchorElement>('a[href*="ejecucionSerie.html"]');
    if (!titulo || !imagen || !duracionP || !btnDetalles || !btnSiguiente) return;

    let serie: Serie, posturaActualIndex = 0, timerId: number;
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');

    if (!dolorInicio) {
        alert('No se indicó el dolor inicial.');
        return window.location.href = 'ejecutarSesion.html';
    }

    try {
        serie = await fetchApi<Serie>('/pacientes/mi-serie'); // Endpoint que devuelve la serie del paciente logueado
        if (!serie?.secuencia?.length) throw new Error('No tienes una serie asignada.');
        mostrarPostura();
    } catch (e) { if (e instanceof Error) alert(e.message); }

    function mostrarPostura() {
        if (posturaActualIndex >= serie.secuencia.length) return finalizarSerie();
        
        const postura = serie.secuencia[posturaActualIndex];
        titulo!.textContent = `Postura ${posturaActualIndex + 1}: ${postura.nombre}`;
        if (imagen) {
            imagen.src = postura.fotoUrl || 'path/to/default-image.png';
        }
        if (duracionP) {
            duracionP.textContent = `Duración: ${postura.duracionMinutos} minuto(s)`;
        }
        if (btnDetalles) {
            btnDetalles.href = `visualizarPosturas.html?posturaId=${postura.id}`;
        }
        
        clearTimeout(timerId);
        timerId = window.setTimeout(siguientePostura, postura.duracionMinutos * 60 * 1000);
    }
    
    function siguientePostura() {
        posturaActualIndex++;
        mostrarPostura();
    }
    
    function finalizarSerie() {
        clearTimeout(timerId);
        window.location.href = `registroSesion.html?dolorInicio=${dolorInicio}`;
    }

    btnSiguiente.addEventListener('click', (e) => { e.preventDefault(); siguientePostura(); });
});