import { fetchApi } from './api';
import { showToast } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
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