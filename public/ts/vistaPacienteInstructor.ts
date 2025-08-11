import { fetchApi} from "./api";
import type { Paciente, Sesion } from "./types";
import { verificarAutenticacion, cerrarSesion, showToast } from "./utils";

/**
 * Script para la vista de progreso de paciente desde perspectiva del instructor
 * @description Muestra información detallada y historial de sesiones de un paciente específico
 */

/**
 * Inicialización del script de vista de paciente para instructor
 * @description Event listener principal que carga y muestra el progreso completo de un paciente
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('pacienteId');

    if (!pacienteId) {
        showToast('No se especificó un paciente.', 'error');
        window.location.href = 'gestionPacientes.html';
        return;
    }

    // Obtener referencias a elementos del DOM para mostrar información
    const nombrePacienteEl = document.querySelector<HTMLHeadingElement>('#nombre-paciente');
    const infoPacienteEl = document.querySelector<HTMLDivElement>('#info-paciente');
    const historialListUl = document.querySelector<HTMLUListElement>('#lista-historial');

    if (!nombrePacienteEl || !infoPacienteEl || !historialListUl) return;

    try {
        // Cargar información del paciente y su historial de sesiones en paralelo
        const [paciente, historial] = await Promise.all([
            fetchApi<Paciente>(`/pacientes/${pacienteId}`),
            fetchApi<Sesion[]>(`/pacientes/${pacienteId}/historial`)
        ]);

        nombrePacienteEl.textContent = `Progreso de: ${paciente.nombre}`;
        infoPacienteEl.innerHTML = `
            <p><strong>Correo:</strong> ${paciente.correo}</p>
            <p><strong>Teléfono:</strong> ${paciente.telefono || 'No registrado'}</p>
            <p><strong>Serie Asignada:</strong> ${paciente.serieAsignada?.nombreSerie || 'Ninguna'}</p>
            <p><strong>Sesiones Completadas:</strong> ${paciente.serieAsignada?.sesionesCompletadas || 0} de ${paciente.serieAsignada?.sesionesRecomendadas || 0}</p>
        `;

        // Renderizar historial de sesiones completadas
        historialListUl.innerHTML = '';
        if (historial.length === 0) {
            historialListUl.innerHTML = '<p>Este paciente aún no ha completado ninguna sesión.</p>';
        } else {
            historial.forEach(sesion => {
                const li = document.createElement('li');
                li.className = 'historial-item';
                
                // Formatear fecha en español
                const fecha = new Date(sesion.fecha).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });

                // Construir HTML con información de la sesión
                li.innerHTML = `
                    <div class="historial-fecha"><strong>Fecha:</strong> ${fecha}</div>
                    <div class="historial-detalle"><strong>Dolor Inicial:</strong> ${sesion.dolorInicial}/4</div>
                    <div class="historial-detalle"><strong>Dolor Final:</strong> ${sesion.dolorFinal}/4</div>
                    <div class="historial-comentario"><strong>Comentario:</strong><br><em>${sesion.comentario || 'N/A'}</em></div>
                `;
                historialListUl.appendChild(li);
            });
        }

    } catch (error) {
        nombrePacienteEl.textContent = 'Error al cargar';
        infoPacienteEl.innerHTML = '<p>No se pudo cargar la información del paciente.</p>';
        historialListUl.innerHTML = '<li>No se pudo cargar el historial.</li>';
        if (error instanceof Error) showToast(error.message, 'error');
    }
});