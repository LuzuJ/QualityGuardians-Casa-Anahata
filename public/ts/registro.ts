import { fetchApi } from './api';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const nombre = data.get('nombre') as string;
        const correo = data.get('correo') as string;
        const password = data.get('password') as string;
        const confirmar = data.get('confirmar') as string;

        if (password !== confirmar) return alert('Las contraseñas no coinciden.');

        try {
            await fetchApi('/instructores', {
                method: 'POST',
                body: JSON.stringify({ nombre, correo, contraseña: password })
            });
            alert('¡Registro exitoso! Redirigiendo para iniciar sesión.');
            window.location.href = 'inicioSesion.html';
        } catch (error) {
            if (error instanceof Error) alert('Error: ' + error.message);
        }
    });
});