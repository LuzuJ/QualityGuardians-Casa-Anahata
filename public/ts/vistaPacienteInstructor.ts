// public/ts/vistaPacienteInstructor.ts

import { fetchApi, showToast } from "./api";
import type { Paciente, Sesion } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('pacienteId');

    if (!pacienteId) {
        showToast('No se especificó un paciente.', 'error');
        window.location.href = 'gestionPacientes.html';
        return;
    }

    const nombrePacienteEl = document.querySelector<HTMLHeadingElement>('#nombre-paciente');
    const infoPacienteEl = document.querySelector<HTMLDivElement>('#info-paciente');
    const historialListUl = document.querySelector<HTMLUListElement>('#lista-historial');

    if (!nombrePacienteEl || !infoPacienteEl || !historialListUl) return;

    try {
        const [paciente, historial] = await Promise.all([
            fetchApi<Paciente>(`/pacientes/${pacienteId}`),
            fetchApi<Sesion[]>(`/pacientes/${pacienteId}/historial`)
        ]);

        // --- BLOQUE CORREGIDO ---
        nombrePacienteEl.textContent = `Progreso de: ${paciente.nombre}`;
        infoPacienteEl.innerHTML = `
            <p><strong>Correo:</strong> ${paciente.correo}</p>
            <p><strong>Teléfono:</strong> ${paciente.telefono || 'No registrado'}</p>
            <p><strong>Serie Asignada:</strong> ${paciente.serieAsignada?.nombreSerie || 'Ninguna'}</p>
            <p><strong>Sesiones Completadas:</strong> ${paciente.serieAsignada?.sesionesCompletadas || 0} de ${paciente.serieAsignada?.sesionesRecomendadas || 0}</p>
        `;

        // Rellenar el historial de sesiones
        historialListUl.innerHTML = '';
        if (historial.length === 0) {
            historialListUl.innerHTML = '<p>Este paciente aún no ha completado ninguna sesión.</p>';
        } else {
            historial.forEach(sesion => {
                const li = document.createElement('li');
                li.className = 'historial-item';
                const fecha = new Date(sesion.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

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
        if (error instanceof Error) showToast(error.message, 'error');
    }
});