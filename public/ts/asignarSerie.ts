import { fetchApi } from './api';
import { showToast, verificarAutenticacion, cerrarSesion } from './utils';
import type { Paciente, Serie } from './types';

/**
 * Script para la página de asignación de series a pacientes
 * @description Maneja la interfaz para que los instructores asignen series de ejercicios a sus pacientes
 */

/**
 * Inicializa la página de asignación de series
 * @description Configura la autenticación, carga los datos de pacientes y series, y maneja el formulario de asignación
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar que el usuario esté autenticado como instructor
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    document.body.classList.add('mostrar');
    
    const pacienteSelect = document.querySelector<HTMLSelectElement>('#pacienteId');
    const serieSelect = document.querySelector<HTMLSelectElement>('#serieId');
    const form = document.querySelector<HTMLFormElement>('.formulario');
    if (!pacienteSelect || !serieSelect || !form) return;

    try {
        // Cargar pacientes y series en paralelo para mejor rendimiento
        const [pacientes, series] = await Promise.all([
            fetchApi<Paciente[]>('/pacientes'),
            fetchApi<Serie[]>('/series')
        ]);
        
        // Poblar select de pacientes
        pacientes.forEach(p => pacienteSelect.add(new Option(p.nombre, p.cedula)));
        
        // Poblar select de series
        series.forEach(s => serieSelect.add(new Option(s.nombre, s.id)));
        
    } catch (e) {
        if (e instanceof Error) showToast(`Error al cargar datos: ${e.message}`, 'error');
    }

    /**
     * Manejador del formulario de asignación de series
     * @description Procesa la asignación de una serie específica a un paciente seleccionado
     * @param {Event} e - Evento de submit del formulario
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pacienteId = pacienteSelect.value;
        const serieId = serieSelect.value;
        
        // Validar que se hayan seleccionado ambos campos
        if (!pacienteId || !serieId) {
            showToast('Por favor, seleccione un paciente y una serie.', 'error');
            return;
        }

        try {
            // Enviar petición de asignación al servidor
            await fetchApi(`/pacientes/${pacienteId}/asignar-serie`, {
                method: 'POST',
                body: JSON.stringify({ serieId })
            });
            
            showToast('Serie asignada correctamente', 'success');
            form.reset();
            
        } catch (e) {
            if (e instanceof Error) showToast(`Error: ${e.message}`, 'error');
        }
    });
});