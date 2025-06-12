import { fetchApi, showToast } from './api';
import type { Paciente } from './types';

document.addEventListener('DOMContentLoaded', async () => {
    const addPatientForm = document.querySelector<HTMLFormElement>('.formulario');
    const patientListUl = document.querySelector<HTMLUListElement>('h3 + ul');
    const formTitle = addPatientForm?.querySelector<HTMLHeadingElement>('h3');
    const submitButton = addPatientForm?.querySelector<HTMLButtonElement>('button[type="submit"]');

    // REFACTOR: Obtenemos referencia a los inputs una sola vez
    const cedulaInput = addPatientForm?.querySelector<HTMLInputElement>('input[name="cedula"]');
    const nombreInput = addPatientForm?.querySelector<HTMLInputElement>('input[name="nombre"]');
    const correoInput = addPatientForm?.querySelector<HTMLInputElement>('input[type="email"]');
    const telefonoInput = addPatientForm?.querySelector<HTMLInputElement>('input[type="tel"]');
    const fechaInput = addPatientForm?.querySelector<HTMLInputElement>('input[type="date"]');

    if (!addPatientForm || !patientListUl || !formTitle || !submitButton || !nombreInput || !correoInput || !telefonoInput || !fechaInput) return;

    let modoEdicion = false;
    let pacienteIdEditando: string | null = null;

    const cargarPacientes = async () => {
        try {
            const pacientes = await fetchApi<Paciente[]>('/pacientes');
            patientListUl.innerHTML = '';
            pacientes.forEach(paciente => {
                const li = document.createElement('li');
                li.textContent = `${paciente.nombre} `;
                const editButton = document.createElement('button');
                editButton.className = 'btn-primario';
                editButton.textContent = 'Editar';
                editButton.onclick = () => iniciarEdicion(paciente);
                li.appendChild(editButton);
                patientListUl.appendChild(li);
            });
        } catch (error) {
            if (error instanceof Error) showToast(`Error al cargar pacientes: ${error.message}`, 'error');
        }
    };

    const iniciarEdicion = (paciente: Paciente) => {
    modoEdicion = true;
    pacienteIdEditando = paciente.cedula;

    if (cedulaInput) {
        cedulaInput.value = paciente.cedula;
        cedulaInput.readOnly = true; // Hacer que el campo no se pueda editar
    }
    if (nombreInput) nombreInput.value = paciente.nombre;
    if (correoInput) correoInput.value = paciente.correo;
    if (telefonoInput) telefonoInput.value = paciente.telefono || '';
    if (fechaInput) fechaInput.value = paciente.fechaNacimiento;

    formTitle.textContent = 'Editar Paciente';
    submitButton.textContent = 'Guardar Cambios';
    window.scrollTo(0, 0);
};
    
    // BUG FIX: Implementamos la lógica de la función
    const resetearFormulario = () => {
        modoEdicion = false;
        pacienteIdEditando = null;
        addPatientForm.reset();
        formTitle.textContent = 'Agregar nuevo paciente';
        submitButton.textContent = 'Agregar paciente';

        if (cedulaInput) cedulaInput.readOnly = false;
    };

    addPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            cedula: (addPatientForm.querySelector('input[name="cedula"]') as HTMLInputElement).value,
            nombre: (addPatientForm.querySelector('input[name="nombre"]') as HTMLInputElement).value,
            correo: (addPatientForm.querySelector('input[name="correo"]') as HTMLInputElement).value,
            telefono: (addPatientForm.querySelector('input[name="telefono"]') as HTMLInputElement).value,
            fechaNacimiento: (addPatientForm.querySelector('input[name="fechaNacimiento"]') as HTMLInputElement).value
        };
        try {
            if (modoEdicion && pacienteIdEditando) {
                await fetchApi(`/pacientes/${pacienteIdEditando}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                showToast('Paciente actualizado con éxito', 'success');
            } else {
                await fetchApi('/pacientes', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                showToast('Paciente agregado con éxito', 'success');
            }
            resetearFormulario();
            await cargarPacientes();
        } catch (error) { if (error instanceof Error) showToast('Error: ' + error.message, 'error'); }
    });

    await cargarPacientes();
});