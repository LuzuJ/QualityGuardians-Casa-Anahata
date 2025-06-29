const API_BASE_URL = '/api';

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
      // --- LÍNEA CORREGIDA ---
      // Ahora busca la propiedad "error" que envía el backend.
      throw new Error(errorData.error || errorData.message || 'Ocurrió un error en la petición.');
    }
    
    // Si la respuesta es vacía (ej. un 204 No Content), devuelve un objeto vacío.
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);

  } catch (error) {
    console.error(`Error en la llamada a ${endpoint}:`, error);
    throw error;
  }
}

// La función showToast no necesita cambios
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