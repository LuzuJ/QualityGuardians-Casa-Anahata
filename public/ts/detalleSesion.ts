import { fetchApi } from "./api";

interface SesionHistorial {
    fecha: string;
    duracionEfectiva?: number;
    pausas?: number;
    dolorInicio: number;
    dolorFin: number;
    comentario: string;
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector<HTMLDivElement>('.contenido-panel .tarjeta');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    let pacienteId = urlParams.get('pacienteId'); // Para el instructor viendo a un paciente

    // Si no hay pacienteId, es el paciente viendo su propio historial
    const endpoint = pacienteId ? `/pacientes/${pacienteId}/historial` : '/pacientes/mi-historial';

    try {
        const historial = await fetchApi<SesionHistorial[]>(endpoint);
        const titulo = container.querySelector('h2')?.outerHTML || '';
        container.innerHTML = titulo;

        if (historial.length === 0) {
            container.innerHTML += '<p>Aún no hay sesiones registradas.</p>';
        } else {
            historial.forEach(sesion => {
                container.innerHTML += `
                <div class="tarjeta" style="margin-top: 1rem; padding: 1rem;">
                    <p><strong>Fecha:</strong> ${new Date(sesion.fecha).toLocaleDateString()}</p>
                    <p><strong>Intensidad inicial:</strong> ${sesion.dolorInicio}</p>
                    <p><strong>Intensidad final:</strong> ${sesion.dolorFin}</p>
                    <p><strong>Comentario:</strong> ${sesion.comentario}</p>
                </div>`;
            });
        }
    } catch (e) { if (e instanceof Error) alert(e.message); }
});