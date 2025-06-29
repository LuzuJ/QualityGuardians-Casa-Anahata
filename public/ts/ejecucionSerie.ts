// public/ts/ejecucionSerie.ts

import { fetchApi, showToast } from "./api"; // Importamos showToast
import type { Serie } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
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

    // --- MANEJO DE ESTADO DE LA SESIÓN ---
    let serie: Serie;
    let posturaActualIndex = 0;
    
    // V1 - Timer
    let timerInterval: number | null = null;
    let tiempoRestante = 0;
    let duracionOriginal = 0;
    let isPaused = true;
    
    // --- NUEVAS VARIABLES PARA VERSIÓN 2 ---
    let pausasContador = 0;
    let tiempoEfectivoTotalSegundos = 0;
    let tiempoEfectivoInterval: number | null = null;
    const horaInicioSesion = new Date(); // Guardamos la hora de inicio al cargar la página

    // --- LÓGICA INICIAL Y VALIDACIÓN ---
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const indexParam = urlParams.get('index');

    if (!dolorInicio) {
        showToast('No se indicó el dolor inicial. Redirigiendo...', 'error'); // CORREGIDO: alert -> showToast
        setTimeout(() => window.location.href = 'ejecutarSesion.html', 2000);
        return;
    }

    // --- LÓGICA DEL CRONÓMETRO (CON MEJORAS V2) ---
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const actualizarDisplay = () => {
        if (timerDisplayEl) timerDisplayEl.textContent = formatTime(tiempoRestante);
    };

    const iniciarTimer = () => {
        if (isPaused === false) return; // Evitar múltiples inicios
        isPaused = false;
        startPauseBtn.textContent = 'Pausar';
        
        // Iniciar contador de tiempo restante de la postura
        timerInterval = window.setInterval(() => {
            tiempoRestante--;
            actualizarDisplay();
            if (tiempoRestante <= 0) {
                siguientePostura();
            }
        }, 1000);

        // Iniciar contador de tiempo efectivo total
        tiempoEfectivoInterval = window.setInterval(() => {
            tiempoEfectivoTotalSegundos++;
        }, 1000);
    };

    const pausarTimer = () => {
        if (isPaused === true) return;
        isPaused = true;
        startPauseBtn.textContent = 'Continuar';
        
        pausasContador++; // AUMENTAMOS EL CONTADOR DE PAUSAS
        
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval); // También pausamos el tiempo efectivo
    };

    const reiniciarTimer = () => {
        pausarTimer();
        startPauseBtn.textContent = 'Iniciar';
        tiempoRestante = duracionOriginal;
        actualizarDisplay();
    };

    const mostrarPostura = () => {
        if (!serie || !serie.secuencia || posturaActualIndex >= serie.secuencia.length) {
            return finalizarSerie();
        }
        
        const postura = serie.secuencia[posturaActualIndex];
        
        tituloEl.textContent = `Postura ${posturaActualIndex + 1}: ${postura.nombre}`;
        imagenEl.src = postura.fotoUrl || '';
        imagenEl.style.display = 'initial';
        
        duracionOriginal = postura.duracionMinutos * 60;
        tiempoRestante = duracionOriginal;

        duracionEl.textContent = `Duración sugerida: ${postura.duracionMinutos} minuto(s)`;
        detallesBtn.href = `visualizarPosturas.html?posturaId=${postura.id}&dolorInicio=${dolorInicio}&index=${posturaActualIndex}`;
        
        reiniciarTimer();

        anteriorBtn.disabled = posturaActualIndex === 0;
        siguienteBtn.textContent = (posturaActualIndex === serie.secuencia.length - 1) ? 'Finalizar Sesión' : 'Siguiente Postura';
    };
    
    const siguientePostura = () => {
        if (!serie.secuencia || posturaActualIndex >= serie.secuencia.length - 1) {
            finalizarSerie();
            return;
        }
        posturaActualIndex++;
        mostrarPostura();
    };
    
    const posturaAnterior = () => {
        if (posturaActualIndex <= 0) return;
        posturaActualIndex--;
        mostrarPostura();
    };
    
    const finalizarSerie = () => {
        pausarTimer(); // Detiene todos los contadores
        const horaFinSesion = new Date();
        const tiempoEfectivoMinutos = Math.round(tiempoEfectivoTotalSegundos / 60);

        // --- ENVIAMOS TODOS LOS DATOS V2 A LA SIGUIENTE PÁGINA ---
        const params = new URLSearchParams({
            dolorInicio: dolorInicio,
            horaInicio: horaInicioSesion.toISOString(),
            horaFin: horaFinSesion.toISOString(),
            tiempoEfectivoMinutos: String(tiempoEfectivoMinutos),
            pausas: String(pausasContador)
        });
        
        window.location.href = `registroSesion.html?${params.toString()}`;
    };

    // --- ASIGNACIÓN DE EVENTOS ---
    startPauseBtn.addEventListener('click', () => {
        isPaused ? iniciarTimer() : pausarTimer();
    });
    
    resetBtn.addEventListener('click', reiniciarTimer);
    siguienteBtn.addEventListener('click', (e) => { e.preventDefault(); siguientePostura(); });
    anteriorBtn.addEventListener('click', (e) => { e.preventDefault(); posturaAnterior(); });

    // --- INICIO DE LA CARGA DE DATOS ---
    try {
        serie = await fetchApi<Serie>('/pacientes/mi-serie');
        if (!serie?.secuencia?.length) {
            throw new Error('No tienes una serie asignada o está vacía.');
        }
        
        posturaActualIndex = indexParam ? parseInt(indexParam, 10) : 0;
        mostrarPostura();
    } catch (e) {
        if (e instanceof Error) {
            showToast(e.message, 'error'); // CORREGIDO: alert -> showToast
            setTimeout(() => window.location.href = 'detalleSesion.html', 2000); // Redirigir al historial si hay error
        }
    }
});