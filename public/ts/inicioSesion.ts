import { fetchApi } from './api';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const btnPaciente = form?.querySelector<HTMLButtonElement>('button[formaction="ejecutarSesion.html"]');
    const btnInstructor = form?.querySelector<HTMLButtonElement>('button[formaction="dashboard.html"]');

    const handleLogin = async (rol: 'paciente' | 'instructor') => {
        const correo = (form?.querySelector('input[name="correo"]') as HTMLInputElement)?.value;
        const password = (form?.querySelector('input[name="password"]') as HTMLInputElement)?.value;

        if (!correo || !password) return alert('Por favor, ingresa correo y contraseña.');

        try {
            const loginPayload = {
                correo,
                contraseña: password,
                rol: rol 
            };

            const data = await fetchApi<{ token: string; rol: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(loginPayload) 
            });

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.rol);

            if (data.rol === 'paciente') window.location.href = 'ejecutarSesion.html';
            else if (data.rol === 'instructor') window.location.href = 'dashboard.html';
            else throw new Error('Rol desconocido recibido del servidor.');

        } catch (error) {
            if (error instanceof Error) alert('Error al iniciar sesión: ' + error.message);
        }
    };

    btnPaciente?.addEventListener('click', (e) => { e.preventDefault(); handleLogin('paciente'); });
    btnInstructor?.addEventListener('click', (e) => { e.preventDefault(); handleLogin('instructor'); });
});