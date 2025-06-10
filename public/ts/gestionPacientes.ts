import { fetchApi } from './api';
import type { Paciente } from './types';

document.addEventListener('DOMContentLoaded', async () => {
    const addPatientForm = document.querySelector<HTMLFormElement>('.formulario');
    const patientListUl = document.querySelector<HTMLUListElement>('h3 + ul');
    if (!addPatientForm || !patientListUl) return;

    const cargarPacientes = async () => {
        try {
            const pacientes = await fetchApi<Paciente[]>('/pacientes');
            patientListUl.innerHTML = '';
            pacientes.forEach(p => {
                const li = document.createElement('li');
                li.textContent = `${p.nombre} `;
                const editButton = document.createElement('button');
                editButton.className = 'btn-primario';
                editButton.textContent = 'Ver Historial';
                editButton.onclick = () => window.location.href = `detalleSesion.html?pacienteId=${p.id}`;
                li.appendChild(editButton);
                patientListUl.appendChild(li);
            });
        } catch (error) { if (error instanceof Error) alert(error.message); }
    };

    addPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: (addPatientForm.querySelector('input[type="text"]') as HTMLInputElement).value,
            correo: (addPatientForm.querySelector('input[type="email"]') as HTMLInputElement).value,
            telefono: (addPatientForm.querySelector('input[type="tel"]') as HTMLInputElement).value,
            fechaNacimiento: (addPatientForm.querySelector('input[type="date"]') as HTMLInputElement).value
        };
        try {
            await fetchApi('/pacientes', { method: 'POST', body: JSON.stringify(data) });
            alert('Paciente agregado');
            addPatientForm.reset();
            await cargarPacientes();
        } catch (error) { if (error instanceof Error) alert(error.message); }
    });

    await cargarPacientes();
});