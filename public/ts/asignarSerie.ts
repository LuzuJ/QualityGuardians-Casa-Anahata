import { fetchApi } from './api';
import type { Paciente, Serie } from './types';

document.addEventListener('DOMContentLoaded', async () => {
    const pacienteSelect = document.querySelector<HTMLSelectElement>('#pacienteId');
    const serieSelect = document.querySelector<HTMLSelectElement>('#serieId');
    const form = document.querySelector<HTMLFormElement>('.formulario');
    if (!pacienteSelect || !serieSelect || !form) return;

    try {
        const [pacientes, series] = await Promise.all([
            fetchApi<Paciente[]>('/pacientes'),
            fetchApi<Serie[]>('/series')
        ]);
        pacientes.forEach(p => pacienteSelect.add(new Option(p.nombre, p.id)));
        series.forEach(s => serieSelect.add(new Option(s.nombre, s.id)));
    } catch (e) { if (e instanceof Error) alert(e.message); }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pacienteId = pacienteSelect.value;
        const serieId = serieSelect.value;
        if (!pacienteId || !serieId) return alert('Seleccione paciente y serie.');

        try {
            await fetchApi(`/pacientes/${pacienteId}/asignar-serie`, {
                method: 'POST',
                body: JSON.stringify({ serieId })
            });
            alert('Serie asignada correctamente');
            form.reset();
        } catch (e) { if (e instanceof Error) alert(e.message); }
    });
});