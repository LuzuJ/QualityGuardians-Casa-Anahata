import { fetchApi } from './api';
import { showToast, setupPasswordToggle } from './utils'; // Importa la nueva función


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.campo-password-contenedor').forEach(container => {
    setupPasswordToggle(container as HTMLElement);
  });
  
  const form = document.querySelector<HTMLFormElement>('.formulario');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const correo = data.get('correo') as string;
    const nuevaContraseña = data.get('nuevaContraseña') as string;
    const confirmarContraseña = data.get('confirmarContraseña') as string;

    if (nuevaContraseña !== confirmarContraseña) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    try {
      const resultado = await fetchApi<{ message: string }>('/pacientes/establecer-password', {
        method: 'POST',
        body: JSON.stringify({ correo, nuevaContraseña })
      });

      showToast(resultado.message, 'success');
      setTimeout(() => {
        window.location.href = 'inicioSesion.html';
      }, 2000); // Redirige después de 2 segundos para que se vea la notificación

    } catch (error) {
      if (error instanceof Error) {
        showToast(`Error: ${error.message}`, 'error');
      }
    }
  });
});