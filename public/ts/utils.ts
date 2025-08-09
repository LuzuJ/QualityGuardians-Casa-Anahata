/**
 * Muestra una notificación temporal (toast) en la pantalla.
 */
export function showToast(message: string, type: 'success' | 'error' = 'success') {    
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${type}`;
    toastElement.textContent = message;
    container.appendChild(toastElement);
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 2800);
    setTimeout(() => {
        toastElement.remove();
        if (container && !container.hasChildNodes()) {
            container.remove();
        }
    }, 3300);
}

/**
 * Verifica si existe un token de autenticación en el localStorage.
 * Si no existe, redirige al usuario a la página de inicio de sesión.
 */
export function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showToast('Debes iniciar sesión para acceder a esta página.', 'error');
        // Usamos un pequeño retraso para que el toast sea visible antes de redirigir
        setTimeout(() => {
            window.location.href = 'inicioSesion.html';
        }, 1000);
    }
}

/**
 * Limpia el localStorage y redirige al inicio de sesión.
 */
export function cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    showToast('Has cerrado la sesión.', 'success');
    setTimeout(() => {
        window.location.href = 'inicioSesion.html';
    }, 1000);
}

/**
 * Configura la funcionalidad de mostrar/ocultar para un campo de contraseña.
 * @param container El elemento contenedor que tiene el input y el botón de toggle.
 */
export function setupPasswordToggle(container: HTMLElement) {
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