/**
 * Módulo de API para manejar comunicación con el backend
 * @description Proporciona funciones para realizar peticiones HTTP autenticadas al servidor
 */

const API_BASE_URL = '/api';
import { showToast } from './utils';

/**
 * Interface que extiende RequestInit para opciones de fetch personalizadas
 * @interface FetchOptions
 * @extends RequestInit
 */
interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Función principal para realizar peticiones HTTP autenticadas
 * @description Maneja todas las comunicaciones con el API del backend, incluyendo autenticación automática y manejo de errores
 * @template T - Tipo de dato esperado en la respuesta
 * @param {string} endpoint - Endpoint de la API (ej: '/usuarios', '/login')
 * @param {FetchOptions} options - Opciones de configuración para la petición HTTP
 * @returns {Promise<T>} Promesa que resuelve con los datos de la respuesta
 * @throws {Error} Lanza errores específicos según el tipo de problema encontrado
 */
export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // Obtener token de autenticación del localStorage
  const token = localStorage.getItem('authToken');

  // Configurar headers por defecto
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Añadir token de autorización si existe
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Combinar configuración por defecto con opciones del usuario
  const config: FetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    // Realizar la petición HTTP
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Manejar respuestas no exitosas
    if (!response.ok) {

      // Caso 1: Error de autenticación (Token inválido o expirado)
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        showToast('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
        setTimeout(() => window.location.href = 'inicioSesion.html', 2500);
        
        throw new Error('Sesión expirada');
      }

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

