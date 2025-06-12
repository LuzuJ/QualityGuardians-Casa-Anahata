import { fetchApi } from './api';
import { showToast } from './utils';
import type { Paciente, Serie } from './types';

document.addEventListener('DOMContentLoaded', async () => {
    document.body.classList.add('mostrar');
    const pacienteSelect = document.querySelector<HTMLSelectElement>('#pacienteId');
    const serieSelect = document.querySelector<HTMLSelectElement>('#serieId');
    const form = document.querySelector<HTMLFormElement>('.formulario');
    if (!pacienteSelect || !serieSelect || !form) return;

    try {
        const [pacientes, series] = await Promise.all([
            fetchApi<Paciente[]>('/pacientes'),
            fetchApi<Serie[]>('/series')
        ]);
        pacientes.forEach(p => pacienteSelect.add(new Option(p.nombre, p.cedula)));
        series.forEach(s => serieSelect.add(new Option(s.nombre, s.id)));
    } catch (e) {
        if (e instanceof Error) showToast(`Error al cargar datos: ${e.message}`, 'error');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pacienteId = pacienteSelect.value;
        const serieId = serieSelect.value;
        if (!pacienteId || !serieId) {
            showToast('Por favor, seleccione un paciente y una serie.', 'error');
            return;
        }

        try {
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