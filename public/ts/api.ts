const API_BASE_URL = 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = localStorage.getItem('authToken');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: FetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocurrió un error en la petición.');
    }
    
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Error en la llamada a ${endpoint}:`, error);
    throw error;
  }
}


export function showToast(message: string, type: 'success' | 'error' = 'success') {
    // Busca el contenedor, o lo crea si no existe
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Crea el elemento de la notificación
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${type}`;
    toastElement.textContent = message;

    // Añade la notificación al contenedor
    container.appendChild(toastElement);

    // Hace visible la notificación para activar la animación
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10); // Un pequeño retraso para que la animación funcione

    // Prepara la notificación para desaparecer
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 2800); // La notificación empieza a desaparecer a los 2.8 segundos

    // Elimina completamente la notificación del DOM después de la animación
    setTimeout(() => {
        toastElement.remove();
    }, 3300); // 2800ms + 500ms de la animación
}