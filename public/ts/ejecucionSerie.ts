import { showToast } from "./utils";
import { fetchApi } from "./api";
import type { Serie } from "./types";
import { verificarAutenticacion, cerrarSesion } from "./utils";

/**
 * Script para la ejecución de series de ejercicios por pacientes
 * @description Maneja la interfaz de ejecución de sesiones donde los pacientes realizan las posturas asignadas con cronómetro y seguimiento
 */

/**
 * Inicializa la página de ejecución de series
 * @description Configura la autenticación, carga la serie asignada, maneja el cronómetro y el seguimiento de progreso
 */
document.addEventListener('DOMContentLoaded', async () => {
    verificarAutenticacion(); 
    
    const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
    btnCerrarSesion?.addEventListener('click', cerrarSesion);

    const tituloEl = document.getElementById('postura-titulo');
    const imagenEl = document.getElementById('postura-imagen') as HTMLImageElement;
    const duracionEl = document.getElementById('postura-duracion');
    const timerDisplayEl = document.getElementById('timer-display');
    const startPauseBtn = document.getElementById('start-pause-btn') as HTMLButtonElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    const detallesBtn = document.getElementById('detalles-btn') as HTMLAnchorElement;
    const siguienteBtn = document.getElementById('siguiente-btn') as HTMLAnchorElement;
    const anteriorBtn = document.getElementById('anterior-btn') as HTMLButtonElement; 

    if (!tituloEl || !imagenEl || !duracionEl || !timerDisplayEl || !startPauseBtn || !resetBtn || !detallesBtn || !siguienteBtn || !anteriorBtn) return;

    let serie: Serie;
    let posturaActualIndex = 0;
    let timerInterval: number | null = null;
    let tiempoRestante = 0;
    let duracionOriginal = 0;
    let isPaused = true;
    
    // Variables para el seguimiento avanzado de la sesión (métricas v2)
    let pausasContador = 0;
    let tiempoEfectivoTotalSegundos = 0;
    let tiempoEfectivoInterval: number | null = null;
    let horaInicioSesion = new Date(); 

    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');

    // Recuperar estado de sesión si viene desde visualización de posturas
    if (urlParams.has('index')) {
        posturaActualIndex = parseInt(urlParams.get('index') || '0', 10);
        tiempoRestante = parseInt(urlParams.get('tiempo') || '0', 10);
        isPaused = urlParams.get('pausado') === 'true';
        pausasContador = parseInt(urlParams.get('pausasCount') || '0', 10);
        tiempoEfectivoTotalSegundos = parseInt(urlParams.get('tiempoEfectivo') || '0', 10);
        horaInicioSesion = new Date(urlParams.get('horaInicio') || new Date());

        if (!isPaused) {
            startPauseBtn.textContent = 'Pausar';
            // La llamada a `iniciarTimer` se hará después de cargar los datos de la serie
        } else {
            startPauseBtn.textContent = 'Continuar';
        }
    }

    if (!dolorInicio) {
        showToast('No se indicó el dolor inicial. Redirigiendo...', 'error');
        return setTimeout(() => window.location.href = 'ejecutarSesion.html', 2000);
    }

    /**
     * Formatea segundos a formato MM:SS para mostrar en el cronómetro
     * @param {number} seconds - Número de segundos a formatear
     * @returns {string} Tiempo formateado en formato MM:SS
     */
    const formatTime = (seconds: number): string => {
        return new Date(seconds * 1000).toISOString().substr(14, 5);
    };

    /**
     * Actualiza la visualización del cronómetro en la interfaz
     * @description Muestra el tiempo restante formateado en el elemento display del timer
     */
    const actualizarDisplay = () => {
        if (timerDisplayEl) timerDisplayEl.textContent = formatTime(tiempoRestante);
    };

    /**
     * Inicia el cronómetro de la postura actual
     * @description Comienza la cuenta regresiva y el contador de tiempo efectivo
     */
    const iniciarTimer = () => {
        if (!isPaused) return;
        isPaused = false;
        startPauseBtn.textContent = 'Pausar';
        
        // Cronómetro principal de cuenta regresiva
        timerInterval = window.setInterval(() => {
            if (tiempoRestante > 0) {
                tiempoRestante--;
                actualizarDisplay();
            } else {
                siguientePostura();
            }
        }, 1000);

        // Contador de tiempo efectivo (sin pausas)
        tiempoEfectivoInterval = window.setInterval(() => {
            tiempoEfectivoTotalSegundos++;
        }, 1000);
    };

    /**
     * Pausa el cronómetro y registra la pausa en las métricas
     * @description Detiene ambos cronómetros e incrementa el contador de pausas
     */
    const pausarTimer = () => {
        if (isPaused) return;
        isPaused = true;
        startPauseBtn.textContent = 'Continuar';
        pausasContador++; // Incrementar contador de pausas para métricas
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval);
    };

    /**
     * Reinicia el cronómetro de la postura actual
     * @description Resetea el tiempo a la duración original de la postura
     */
    const reiniciarTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval);
        isPaused = true;
        startPauseBtn.textContent = 'Iniciar';
        tiempoRestante = duracionOriginal;
        actualizarDisplay();
    };

    /**
     * Muestra la postura actual en la interfaz
     * @description Actualiza todos los elementos visuales con la información de la postura actual
     */
    const mostrarPostura = () => {
        // Verificar si hemos llegado al final de la serie
        if (!serie || !serie.secuencia || posturaActualIndex >= serie.secuencia.length) {
            return finalizarSerie();
        }
        
        const postura = serie.secuencia[posturaActualIndex];
        
        // Actualizar información de la postura en la interfaz
        tituloEl.textContent = `Postura ${posturaActualIndex + 1}: ${postura.nombre}`;
        imagenEl.src = postura.fotoUrl || '';
        imagenEl.style.display = 'block';
        duracionOriginal = postura.duracionMinutos * 60;
        
        // Configurar enlace a detalles con estado actual preservado
        detallesBtn.href = `visualizarPosturas.html?posturaId=${postura.id}&dolorInicio=${dolorInicio}&index=${posturaActualIndex}&tiempo=${tiempoRestante}&pausado=${isPaused}&pausasCount=${pausasContador}&tiempoEfectivo=${tiempoEfectivoTotalSegundos}&horaInicio=${horaInicioSesion.toISOString()}`;
        
        reiniciarTimer();
        anteriorBtn.disabled = posturaActualIndex === 0;
        siguienteBtn.textContent = (posturaActualIndex === serie.secuencia.length - 1) ? 'Finalizar Sesión' : 'Siguiente Postura';
    };
    
    /**
     * Avanza a la siguiente postura en la serie
     * @description Incrementa el índice y muestra la siguiente postura, o finaliza si es la última
     */
    const siguientePostura = () => {
        if (!serie.secuencia || posturaActualIndex >= serie.secuencia.length - 1) return finalizarSerie();
        posturaActualIndex++;
        mostrarPostura();
    };
    
    /**
     * Retrocede a la postura anterior en la serie
     * @description Decrementa el índice y muestra la postura anterior si no es la primera
     */
    const posturaAnterior = () => {
        if (posturaActualIndex <= 0) return;
        posturaActualIndex--;
        mostrarPostura();
    };
    
    /**
     * Finaliza la sesión de ejercicios y redirige al registro
     * @description Detiene todos los cronómetros, calcula métricas finales y redirige a la página de registro
     */
    const finalizarSerie = () => {
        // Detener todos los cronómetros activos
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval);

        // Calcular métricas finales de la sesión
        const horaFinSesion = new Date();
        const tiempoEfectivoMinutos = Math.round(tiempoEfectivoTotalSegundos / 60);

        // Preparar parámetros con todas las métricas de la sesión
        const params = new URLSearchParams({
            dolorInicio: dolorInicio,
            horaInicio: horaInicioSesion.toISOString(),
            horaFin: horaFinSesion.toISOString(),
            tiempoEfectivoMinutos: String(tiempoEfectivoMinutos),
            pausas: String(pausasContador)
        });
        
        window.location.href = `registroSesion.html?${params.toString()}`;
    };

    startPauseBtn.addEventListener('click', () => { isPaused ? iniciarTimer() : pausarTimer(); });
    resetBtn.addEventListener('click', reiniciarTimer);
    siguienteBtn.addEventListener('click', (e) => { e.preventDefault(); siguientePostura(); });
    anteriorBtn.addEventListener('click', (e) => { e.preventDefault(); posturaAnterior(); });

    try {
        serie = await fetchApi<Serie>('/pacientes/mi-serie');
        
        if (!serie?.secuencia?.length) throw new Error('No tienes una serie asignada o está vacía.');
        
        // Mostrar la primera postura (o la postura actual si se está reanudando)
        mostrarPostura();
    } catch (e) {
        if (e instanceof Error) {
            showToast(e.message, 'error');
            setTimeout(() => window.location.href = 'detalleSesion.html', 2000);
        }
    }
});