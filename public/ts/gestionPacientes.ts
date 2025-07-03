import { fetchApi, showToast } from './api';
import type { Paciente } from './types';
import { verificarAutenticacion, cerrarSesion } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 

    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const addPatientForm = document.querySelector<HTMLFormElement>('.formulario');
    const patientListUl = document.querySelector<HTMLUListElement>('h3 + ul');
    const formTitle = addPatientForm?.querySelector<HTMLHeadingElement>('h3');
    const submitButton = addPatientForm?.querySelector<HTMLButtonElement>('button[type="submit"]');

    const cedulaInput = addPatientForm?.querySelector<HTMLInputElement>('input[name="cedula"]');
    const nombreInput = addPatientForm?.querySelector<HTMLInputElement>('input[name="nombre"]');
    const correoInput = addPatientForm?.querySelector<HTMLInputElement>('input[type="email"]');
    const telefonoInput = addPatientForm?.querySelector<HTMLInputElement>('input[type="tel"]');
    const fechaInput = addPatientForm?.querySelector<HTMLInputElement>('input[type="date"]');

    if (!addPatientForm || !patientListUl || !formTitle || !submitButton || !cedulaInput || !nombreInput || !correoInput || !telefonoInput || !fechaInput) return;

    let modoEdicion = false;
    let pacienteIdEditando: string | null = null;

    const cargarPacientes = async () => {
        try {
            const pacientes = await fetchApi<Paciente[]>('/pacientes');
            patientListUl.innerHTML = '';
            pacientes.forEach(paciente => {
                const li = document.createElement('li');
                li.textContent = `${paciente.nombre} (${paciente.correo}) `;
                li.style.marginBottom = '10px';

                // Botón para editar la información del paciente
                const editButton = document.createElement('button');
                editButton.className = 'btn-secundario';
                editButton.textContent = 'Editar';
                editButton.onclick = () => iniciarEdicion(paciente);
                li.appendChild(editButton);

                // --- BOTÓN PARA VER EL PROGRESO (HISTORIAL) ---
                const progressButton = document.createElement('button');
                progressButton.className = 'btn-primario';
                progressButton.textContent = 'Ver Progreso';
                progressButton.style.marginLeft = '10px';
                progressButton.onclick = () => {
                    window.location.href = `vistaPacienteInstructor.html?pacienteId=${paciente.cedula}`;
                };
                li.appendChild(progressButton);
                // --- FIN DEL BOTÓN DE PROGRESO ---

                patientListUl.appendChild(li);
            });
        } catch (error) {
            if (error instanceof Error) showToast(`Error al cargar pacientes: ${error.message}`, 'error');
        }
    };

    const iniciarEdicion = (paciente: Paciente) => {
        modoEdicion = true;
        pacienteIdEditando = paciente.cedula;

        cedulaInput.value = paciente.cedula;
        cedulaInput.readOnly = true;
        nombreInput.value = paciente.nombre;
        correoInput.value = paciente.correo;
        telefonoInput.value = paciente.telefono || '';
        if (paciente.fechaNacimiento) {
            fechaInput.value = paciente.fechaNacimiento.split('T')[0]; // Formato YYYY-MM-DD
        }

        formTitle.textContent = 'Editar Paciente';
        submitButton.textContent = 'Guardar Cambios';
        window.scrollTo(0, 0);
    };
    
    const resetearFormulario = () => {
        modoEdicion = false;
        pacienteIdEditando = null;
        addPatientForm.reset();
        formTitle.textContent = 'Agregar nuevo paciente';
        submitButton.textContent = 'Agregar paciente';
        cedulaInput.readOnly = false;
    };

    addPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            cedula: cedulaInput.value,
            nombre: nombreInput.value,
            correo: correoInput.value,
            telefono: telefonoInput.value,
            fechaNacimiento: fechaInput.value
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