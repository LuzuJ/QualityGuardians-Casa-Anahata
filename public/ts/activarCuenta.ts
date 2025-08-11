import { fetchApi } from './api';
import { showToast, setupPasswordToggle } from './utils'; 

/**
 * Script para la activación de cuenta de pacientes
 * @description Maneja el formulario de activación de cuenta donde los pacientes establecen su contraseña inicial
 */

/**
 * Inicializa los componentes y eventos de la página de activación de cuenta
 * @description Configura los toggles de visibilidad de contraseña y el manejador del formulario de activación
 */
document.addEventListener('DOMContentLoaded', () => {
  // Configurar toggles de visibilidad para campos de contraseña
  document.querySelectorAll('.campo-password-contenedor').forEach(container => {
    setupPasswordToggle(container as HTMLElement);
  });
  
  const form = document.querySelector<HTMLFormElement>('.formulario');

  /**
   * Manejador del evento submit del formulario de activación
   * @description Procesa el formulario de establecimiento de contraseña inicial del paciente
   * @param {Event} event - Evento de submit del formulario
   */
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener datos del formulario
    const data = new FormData(form);
    const correo = data.get('correo') as string;
    const nuevaContraseña = data.get('nuevaContraseña') as string;
    const confirmarContraseña = data.get('confirmarContraseña') as string;

    // Validar que las contraseñas coincidan
    if (nuevaContraseña !== confirmarContraseña) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    try {
      // Enviar petición para establecer la contraseña
      const resultado = await fetchApi<{ message: string }>('/pacientes/establecer-password', {
        method: 'POST',
        body: JSON.stringify({ correo, nuevaContraseña })
      });

      // Mostrar mensaje de éxito y redirigir
      showToast(resultado.message, 'success');
      setTimeout(() => {
        window.location.href = 'inicioSesion.html';
      }, 2000); // Redirige después de 2 segundos para que se vea la notificación

    } catch (error) {
      // Manejar errores y mostrar mensaje al usuario
      if (error instanceof Error) {
        showToast(`Error: ${error.message}`, 'error');
      }
    }
  });
});