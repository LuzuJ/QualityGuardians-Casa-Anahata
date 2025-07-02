import { fetchApi } from './api';
import { showToast } from './utils';

function setupPasswordToggle(container: HTMLElement) {
    const input = container.querySelector<HTMLInputElement>('input[type="password"], input[type="text"]');
    const toggle = container.querySelector<HTMLElement>('.toggle-password');

    if (!input || !toggle) return;

    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '🙈';
        } else {
            input.type = 'password';
            toggle.textContent = '👁️';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    const passwordContainer = document.querySelector('.campo-password-contenedor');
    if (passwordContainer) {
        setupPasswordToggle(passwordContainer as HTMLElement);
    }

    
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const btnPaciente = form?.querySelector<HTMLButtonElement>('button[formaction="ejecutarSesion.html"]');
    const btnInstructor = form?.querySelector<HTMLButtonElement>('button[formaction="dashboard.html"]');

    const handleLogin = async (rol: 'paciente' | 'instructor') => {
        const correo = (form?.querySelector('input[name="correo"]') as HTMLInputElement)?.value;
        const password = (form?.querySelector('input[name="password"]') as HTMLInputElement)?.value;

        if (!correo || !password) {
            showToast('Por favor, ingresa correo y contraseña.', 'error');
            return;
        }

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
            if (error instanceof Error) showToast(`Error: ${error.message}`, 'error');
        }
    };

    btnPaciente?.addEventListener('click', (e) => { e.preventDefault(); handleLogin('paciente'); });
    btnInstructor?.addEventListener('click', (e) => { e.preventDefault(); handleLogin('instructor'); });
});