import { fetchApi } from './api';
import { showToast, setupPasswordToggle } from './utils';

/**
 * Script para la página de inicio de sesión
 * @description Maneja la autenticación de usuarios (pacientes e instructores) con validación de credenciales
 */

/**
 * Inicialización del script de inicio de sesión
 * @description Event listener principal que configura la funcionalidad de autenticación
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {

    // Configurar funcionalidad de mostrar/ocultar contraseña
    const passwordContainer = document.querySelector('.campo-password-contenedor');
    if (passwordContainer) {
        setupPasswordToggle(passwordContainer as HTMLElement);
    }

    const form = document.querySelector<HTMLFormElement>('.formulario');
    const btnPaciente = form?.querySelector<HTMLButtonElement>('button[formaction="ejecutarSesion.html"]');
    const btnInstructor = form?.querySelector<HTMLButtonElement>('button[formaction="dashboard.html"]');

    /**
     * Maneja el proceso de autenticación de usuarios
     * @description Valida credenciales y redirige según el rol del usuario
     * @param {('paciente' | 'instructor')} rol - Tipo de usuario que intenta iniciar sesión
     * @returns {Promise<void>} Promesa que se resuelve cuando se completa el login
     * @throws {Error} Error si fallan las credenciales o hay problemas de conexión
     */
    const handleLogin = async (rol: 'paciente' | 'instructor') => {
        const correo = (form?.querySelector('input[name="correo"]') as HTMLInputElement)?.value;
        const password = (form?.querySelector('input[name="password"]') as HTMLInputElement)?.value;

        if (!correo || !password) {
            showToast('Por favor, ingresa correo y contraseña.', 'error');
            return;
        }

        try {
            // Preparar datos para el proceso de autenticación
            const loginPayload = {
                correo,
                contraseña: password,
                rol: rol 
            };

            const data = await fetchApi<{ token: string; rol: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginPayload) 
            });

            // Almacenar token de autenticación y rol en localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.rol);

            // Redirigir según el rol del usuario autenticado
            if (data.rol === 'paciente') window.location.href = 'ejecutarSesion.html';
            else if (data.rol === 'instructor') window.location.href = 'dashboard.html';
            else throw new Error('Rol desconocido recibido del servidor.');

        } catch (error) {
            if (error instanceof Error) showToast(`Error: ${error.message}`, 'error');
        }
    };

    // Configurar event listeners para los botones de inicio de sesión
    // Botón para pacientes - redirige a página de ejecución de sesiones
    btnPaciente?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        handleLogin('paciente'); 
    });
    
    // Botón para instructores - redirige a dashboard administrativo
    btnInstructor?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        handleLogin('instructor'); 
    });
});