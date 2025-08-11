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

      // Caso 1: Error de autenticación (Token inválido o expirado)
      if (response.status === 401) {
        // Limpiamos los datos de sesión del usuario
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        // Mostramos un mensaje claro y redirigimos
        showToast('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
        setTimeout(() => window.location.href = 'inicioSesion.html', 2500);
        
        // Lanzamos un error para detener la ejecución del código que llamó a fetchApi
        throw new Error('Sesión expirada');
      }

      // Intentamos leer el mensaje de error del backend
      const errorData = await response.json().catch(() => ({})); // Previene un crash si la respuesta no es JSON
      const serverMessage = errorData.error || errorData.message;

      // Caso 2: Error del servidor (500 o superior)
      if (response.status >= 500) {
        throw new Error('Hubo un problema con el servidor. Por favor, intenta más tarde.');
      }

      // Caso 3: Otros errores (400, 404, etc.), usamos el mensaje del servidor si existe
      throw new Error(serverMessage || 'Ocurrió un error en la petición.');
      
    }
    
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