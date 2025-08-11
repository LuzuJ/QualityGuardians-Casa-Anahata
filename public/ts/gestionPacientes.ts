import { fetchApi } from './api';
import type { Paciente } from './types';
import { verificarAutenticacion, cerrarSesion, showToast } from './utils';

/**
 * Script para la página de gestión de pacientes
 * @description Maneja la interfaz donde los instructores pueden crear, editar y visualizar sus pacientes asignados
 */

/**
 * Valida el formato y algoritmo de una cédula ecuatoriana
 * @description Verifica que la cédula tenga 10 dígitos y cumpla con el algoritmo de validación oficial
 * @param {string} cedula - Número de cédula a validar
 * @returns {boolean} true si la cédula es válida, false en caso contrario
 * @example
 * validarCedula('1234567890') // returns boolean
 */
function validarCedula(cedula: string): boolean {
    // Verificar que sea string, tenga 10 dígitos y solo contenga números
    if (typeof cedula !== 'string' || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
        return false;
    }
    
    // Aplicar algoritmo de validación de cédula ecuatoriana
    const digitos = cedula.split('').map(Number);
    const verificador = digitos.pop();
    const suma = digitos.reduce((acc, val, i) => {
        let prod = val * (i % 2 === 0 ? 2 : 1);
        if (prod > 9) prod -= 9;
        return acc + prod;
    }, 0);
    const resultado = (Math.ceil(suma / 10) * 10) - suma;
    return verificador === (resultado === 10 ? 0 : resultado);
}


/**
 * Inicialización del script de gestión de pacientes
 * @description Event listener principal que configura toda la funcionalidad de gestión de pacientes
 * @param {Event} event - Evento DOMContentLoaded
 */
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
    const generoSelect = addPatientForm?.querySelector<HTMLSelectElement>('select[name="genero"]');
    const observacionesTextarea = addPatientForm?.querySelector<HTMLTextAreaElement>('textarea[name="observaciones"]');

    if (!addPatientForm || !patientListUl || !formTitle || !submitButton || !cedulaInput || !nombreInput || !correoInput || !telefonoInput || !fechaInput || !generoSelect || !observacionesTextarea) return;

    // Variables de estado para controlar el modo de operación del formulario
    let modoEdicion = false; // Indica si estamos editando un paciente existente
    let pacienteIdEditando: string | null = null; // ID del paciente siendo editado

    /**
     * Carga y muestra la lista de pacientes del instructor
     * @description Obtiene los pacientes asignados al instructor y los renderiza en la interfaz
     * @returns {Promise<void>} Promesa que se resuelve cuando se cargan los pacientes
     * @throws {Error} Error si falla la carga de pacientes
     */
    const cargarPacientes = async () => {
        const patientListUl = document.querySelector<HTMLUListElement>('#lista-pacientes');
        if (!patientListUl) return;
        
        patientListUl.innerHTML = '<li id="loading-pacientes">Cargando pacientes...</li>';

        try {
            const pacientes = await fetchApi<Paciente[]>('/pacientes');
            patientListUl.innerHTML = '';

            if (pacientes.length === 0) {
                patientListUl.innerHTML = '<li>No tienes pacientes registrados todavía.</li>';
                return;
            }

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

                // Botón para ver el progreso/historial del paciente
                const progressButton = document.createElement('button');
                progressButton.className = 'btn-primario';
                progressButton.textContent = 'Ver Progreso';
                progressButton.style.marginLeft = '10px';
                progressButton.onclick = () => {
                    // Navegar a la vista de progreso del paciente específico
                    window.location.href = `vistaPacienteInstructor.html?pacienteId=${paciente.cedula}`;
                };
                li.appendChild(progressButton);

                patientListUl.appendChild(li);
            });
        } catch (error) {
            patientListUl.innerHTML = '<li>Error al cargar los pacientes. Por favor, intenta de nuevo.</li>';
            if (error instanceof Error) showToast(`Error: ${error.message}`, 'error');
        }
    };

    /**
     * Inicia el modo de edición para un paciente específico
     * @description Rellena el formulario con los datos del paciente y cambia al modo edición
     * @param {Paciente} paciente - Datos del paciente a editar
     */
    const iniciarEdicion = (paciente: Paciente) => {
        // Activar modo edición y guardar ID del paciente
        modoEdicion = true;
        pacienteIdEditando = paciente.cedula;

        cedulaInput.value = paciente.cedula;
        cedulaInput.readOnly = true; // La cédula no se puede modificar
        nombreInput.value = paciente.nombre;
        correoInput.value = paciente.correo;
        telefonoInput.value = paciente.telefono || '';
        
        // Formatear fecha de nacimiento para input tipo date
        if (paciente.fechaNacimiento) {
            fechaInput.value = paciente.fechaNacimiento.split('T')[0]; // Formato YYYY-MM-DD
        }
        
        // Configurar campos opcionales
        if (generoSelect) {
            generoSelect.value = paciente.genero || '';
        }
        if (observacionesTextarea) {
            observacionesTextarea.value = paciente.observaciones || '';
        }

        formTitle.textContent = 'Editar Paciente';
        submitButton.textContent = 'Guardar Cambios';
        window.scrollTo(0, 0); // Desplazar hacia el formulario
    };
    
    /**
     * Resetea el formulario al estado inicial para crear nuevo paciente
     * @description Limpia todos los campos y restaura el modo creación
     */
    const resetearFormulario = () => {
        modoEdicion = false;
        pacienteIdEditando = null;
        addPatientForm.reset();
        
        formTitle.textContent = 'Agregar nuevo paciente';
        submitButton.textContent = 'Agregar paciente';
        cedulaInput.readOnly = false; // Permitir edición de cédula para nuevo paciente
    };

    /**
     * Maneja el envío del formulario de paciente
     * @description Procesa la creación o actualización de paciente según el modo actual
     * @param {Event} e - Evento de submit del formulario
     */
    addPatientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            cedula: cedulaInput.value,
            nombre: nombreInput.value,
            correo: correoInput.value,
            telefono: telefonoInput.value,
            fechaNacimiento: fechaInput.value, 
            genero: generoSelect?.value || '',
            observaciones: observacionesTextarea.value || ''
        };
        
        // Validar cédula ecuatoriana
        if (!validarCedula(cedulaInput.value)) {
            return showToast('El número de cédula no es válido.', 'error');
        }
        
        // Validar formato de teléfono
        if (!/^\d{10}$/.test(telefonoInput.value)) {
            return showToast('El número de teléfono debe contener solo números (de 7 a 10 dígitos).', 'error');
        }
        
        try {
            // Determinar si crear o actualizar paciente
            if (modoEdicion && pacienteIdEditando) {
                // Actualizar paciente existente
                await fetchApi(`/pacientes/${pacienteIdEditando}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                showToast('Paciente actualizado con éxito', 'success');
            } else {
                // Crear nuevo paciente
                await fetchApi('/pacientes', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                showToast('Paciente agregado con éxito', 'success');
            }
            
            // Resetear formulario y recargar lista después de operación exitosa
            resetearFormulario();
            await cargarPacientes();
        } catch (error) { 
            // Manejar errores en la operación
            if (error instanceof Error) showToast('Error: ' + error.message, 'error'); 
        }
    });

    await cargarPacientes();
});