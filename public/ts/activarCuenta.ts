import { fetchApi } from './api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector<HTMLFormElement>('.formulario');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const correo = data.get('correo') as string;
    const nuevaContraseña = data.get('nuevaContraseña') as string;
    const confirmarContraseña = data.get('confirmarContraseña') as string;

    if (nuevaContraseña !== confirmarContraseña) {
      alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }

    try {
      // Llamamos al nuevo endpoint que creamos en el backend
      const resultado = await fetchApi<{ message: string }>('/pacientes/establecer-password', {
        method: 'POST',
        body: JSON.stringify({ correo, nuevaContraseña })
      });

      alert(resultado.message + ' Serás redirigido para iniciar sesión.');
      window.location.href = 'inicioSesion.html';

    } catch (error) {
      if (error instanceof Error) {
        alert('Error al activar la cuenta: ' + error.message);
      }
    }
  });
});