import { fetchApi } from './api';
import { showToast, setupPasswordToggle } from './utils';

/**
 * Script para la página de registro de instructores
 * @description Maneja el formulario de registro para nuevos instructores con validación de contraseñas
 */

/**
 * Inicialización del script de registro
 * @description Event listener principal que configura la funcionalidad de registro de instructores
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.campo-password-contenedor').forEach(container => {
        setupPasswordToggle(container as HTMLElement);
    });

    const form = document.querySelector<HTMLFormElement>('.formulario');
    
    /**
     * Maneja el envío del formulario de registro
     * @description Procesa el registro de un nuevo instructor con validación de datos
     * @param {Event} e - Evento de submit del formulario
     */
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Extraer datos del formulario
        const data = new FormData(form);
        const nombre = data.get('nombre') as string;
        const correo = data.get('correo') as string;
        const password = data.get('password') as string;
        const confirmar = data.get('confirmar') as string;

        if (password !== confirmar) {
            showToast('Las contraseñas no coinciden.', 'error');
            return;
        }

        try {
            await fetchApi('/instructores', {
                method: 'POST',
                body: JSON.stringify({ nombre, correo, contraseña: password })
            });
            
            showToast('¡Registro exitoso! Redirigiendo...', 'success');
            setTimeout(() => window.location.href = 'inicioSesion.html', 2000);
        } catch (error) {
            if (error instanceof Error) showToast(`Error: ${error.message}`, 'error');
        }
    });
});