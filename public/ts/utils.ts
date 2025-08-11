/**
 * Módulo de utilidades comunes para la aplicación Casa Anahata
 * @description Proporciona funciones auxiliares para autenticación, notificaciones y UI
 */

/**
 * Muestra una notificación temporal (toast) en la pantalla
 * @description Crea y muestra un mensaje temporal con animaciones de entrada y salida
 * @param {string} message - Texto del mensaje a mostrar
 * @param {'success' | 'error'} type - Tipo de notificación que determina el estilo visual
 * @exported Función exportada para uso en otros módulos
 * @example
 * showToast('Operación exitosa', 'success')
 * showToast('Error en la operación', 'error')
 */
export function showToast(message: string, type: 'success' | 'error' = 'success') {    
    // Buscar contenedor existente o crear uno nuevo si no existe
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Crear elemento toast con el mensaje y estilo apropiado
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${type}`;
    toastElement.textContent = message;
    container.appendChild(toastElement);
    
    // Animación de entrada: mostrar toast después de un breve delay
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10);
    
    // Animación de salida: ocultar toast después de 2.8 segundos
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 2800);
    
    // Limpiar: remover elemento y contenedor si está vacío
    setTimeout(() => {
        toastElement.remove();
        if (container && !container.hasChildNodes()) {
            container.remove();
        }
    }, 3300);
}

/**
 * Verifica la autenticación del usuario actual
 * @description Comprueba la existencia de token de autenticación y redirige si es necesario
 * @exported Función exportada para uso en otros módulos
 * @throws {void} Redirige a inicioSesion.html si no hay token válido
 * @example
 * verificarAutenticacion() // Valida sesión o redirige al login
 */
export function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    
    // Si no existe token, mostrar error y redirigir al login
    if (!token) {
        showToast('Debes iniciar sesión para acceder a esta página.', 'error');
        setTimeout(() => {
            window.location.href = 'inicioSesion.html';
        }, 1000);
    }
}

/**
 * Cierra la sesión del usuario actual
 * @description Limpia datos de autenticación del almacenamiento local y redirige al login
 * @exported Función exportada para uso en otros módulos
 * @example
 * cerrarSesion() // Limpia sesión y redirige al login
 */
export function cerrarSesion() {
    // Remover datos de autenticación del almacenamiento local
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    // Mostrar confirmación de cierre de sesión
    showToast('Has cerrado la sesión.', 'success');
    
    // Redirigir a página de inicio de sesión después de un delay
    setTimeout(() => {
        window.location.href = 'inicioSesion.html';
    }, 1000);
}

/**
 * Configura la funcionalidad de mostrar/ocultar para un campo de contraseña
 * @description Añade interactividad para alternar la visibilidad de contraseñas con botón toggle
 * @param {HTMLElement} container - Elemento contenedor que incluye el input y botón de toggle
 * @exported Función exportada para uso en otros módulos
 * @example
 * setupPasswordToggle(passwordContainer) // Habilita toggle de visibilidad
 */
export function setupPasswordToggle(container: HTMLElement) {
    const input = container.querySelector<HTMLInputElement>('input[type="password"], input[type="text"]');
    const toggle = container.querySelector<HTMLElement>('.toggle-password');

    // Verificar que ambos elementos existan antes de configurar
    if (!input || !toggle) return;

    // Configurar event listener para alternar visibilidad
    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            // Mostrar contraseña: cambiar a texto plano
            input.type = 'text';
            toggle.textContent = '🙈'; // Icono de "ocultar"
        } else {
            // Ocultar contraseña: cambiar a tipo password
            input.type = 'password';
            toggle.textContent = '👁️'; // Icono de "mostrar"
        }
    });
}