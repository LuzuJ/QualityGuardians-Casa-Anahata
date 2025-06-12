import { fetchApi } from "./api";
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
    
    let timerInterval: number | null = null;
    let tiempoRestante = 0;
    let duracionOriginal = 0;
    let isPaused = true;

    // Leemos los parámetros de la URL para restaurar el estado si volvemos de "detalles"
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const indexParam = urlParams.get('index');
    const tiempoParam = urlParams.get('tiempo');

    if (!dolorInicio) {
        alert('No se indicó el dolor inicial.');
        return window.location.href = 'ejecutarSesion.html';
    }

    // --- LÓGICA DEL CRONÓMETRO ---
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const actualizarDisplay = () => {
        if (timerDisplayEl) timerDisplayEl.textContent = formatTime(tiempoRestante);
    };

    const iniciarTimer = () => {
        if (timerInterval) clearInterval(timerInterval); // Limpiar cualquier timer anterior
        isPaused = false;
        startPauseBtn.textContent = 'Pausar';
        
        timerInterval = window.setInterval(() => {
            tiempoRestante--;
            actualizarDisplay();
            if (tiempoRestante <= 0) {
                siguientePostura();
            }
        }, 1000);
    };

    const pausarTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        isPaused = true;
        startPauseBtn.textContent = 'Continuar';
    };

    const reiniciarTimer = () => {
        pausarTimer();
        tiempoRestante = duracionOriginal;
        isPaused = true;
        startPauseBtn.textContent = 'Iniciar';
        actualizarDisplay();
    };

    const mostrarPostura = () => {
        if (posturaActualIndex >= serie.secuencia.length) return finalizarSerie();
        
        const postura = serie.secuencia[posturaActualIndex];
        
        tituloEl.textContent = `Postura ${posturaActualIndex + 1}: ${postura.nombre}`;
        imagenEl.src = postura.fotoUrl || '';
        imagenEl.style.display = 'block';
        
        duracionOriginal = postura.duracionMinutos * 60;
        tiempoRestante = duracionOriginal;

        duracionEl.textContent = `Duración sugerida: ${postura.duracionMinutos} minuto(s)`;
        
        detallesBtn.href = `visualizarPosturas.html?posturaId=${postura.id}&dolorInicio=${dolorInicio}&index=${posturaActualIndex}`;
        
        reiniciarTimer(); // Reinicia el cronómetro para la nueva postura

        // --- LÓGICA PARA HABILITAR/DESHABILITAR BOTONES ---
        anteriorBtn.disabled = posturaActualIndex === 0;
        siguienteBtn.textContent = (posturaActualIndex === serie.secuencia.length - 1) ? 'Finalizar Sesión' : 'Siguiente Postura';
    };
    
    const siguientePostura = () => {
        if (posturaActualIndex >= serie.secuencia.length - 1) {
            finalizarSerie();
            return;
        }
        posturaActualIndex++;
        mostrarPostura();
    };
    
    // --- NUEVA FUNCIÓN PARA LA POSTURA ANTERIOR ---
    const posturaAnterior = () => {
        if (posturaActualIndex <= 0) return; // No hacer nada si es la primera
        posturaActualIndex--;
        mostrarPostura();
    };
    
    const finalizarSerie = () => {
        if (timerInterval) clearInterval(timerInterval);
        window.location.href = `registroSesion.html?dolorInicio=${dolorInicio}`;
    };

    // --- ASIGNACIÓN DE EVENTOS (AÑADIMOS EL NUEVO BOTÓN) ---
    startPauseBtn.addEventListener('click', () => {
        isPaused ? iniciarTimer() : pausarTimer();
    });
    
    resetBtn.addEventListener('click', reiniciarTimer);
    siguienteBtn.addEventListener('click', (e) => { e.preventDefault(); siguientePostura(); });
    anteriorBtn.addEventListener('click', (e) => { e.preventDefault(); posturaAnterior(); }); // <-- NUEVO EVENTO

    // --- INICIO DE LA CARGA DE DATOS ---
    try {
        serie = await fetchApi<Serie>('/pacientes/mi-serie');
        if (!serie?.secuencia?.length) throw new Error('No tienes una serie asignada.');
        
        posturaActualIndex = indexParam ? parseInt(indexParam, 10) : 0;
        
        mostrarPostura();
    } catch (e) {
        if (e instanceof Error) alert(e.message);
    }
});