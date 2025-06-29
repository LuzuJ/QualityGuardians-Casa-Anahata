// public/ts/ejecucionSerie.ts

import { fetchApi, showToast } from "./api";
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
    
    // --- NUEVAS VARIABLES PARA VERSIÓN 2 ---
    let pausasContador = 0;
    let tiempoEfectivoTotalSegundos = 0;
    let tiempoEfectivoInterval: number | null = null;
    const horaInicioSesion = new Date(); // Guardamos la hora de inicio al cargar la página

    // --- LÓGICA INICIAL ---
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    if (!dolorInicio) {
        showToast('No se indicó el dolor inicial. Redirigiendo...', 'error');
        return setTimeout(() => window.location.href = 'ejecutarSesion.html', 2000);
    }

    // --- FUNCIONES DEL CRONÓMETRO Y LÓGICA V2 ---
    const formatTime = (seconds: number): string => {
        return new Date(seconds * 1000).toISOString().substr(14, 5);
    };

    const actualizarDisplay = () => {
        if (timerDisplayEl) timerDisplayEl.textContent = formatTime(tiempoRestante);
    };

    const iniciarTimer = () => {
        if (!isPaused) return;
        isPaused = false;
        startPauseBtn.textContent = 'Pausar';
        
        timerInterval = window.setInterval(() => {
            if (tiempoRestante > 0) {
                tiempoRestante--;
                actualizarDisplay();
            } else {
                siguientePostura();
            }
        }, 1000);

        tiempoEfectivoInterval = window.setInterval(() => {
            tiempoEfectivoTotalSegundos++;
        }, 1000);
    };

    const pausarTimer = () => {
        if (isPaused) return;
        isPaused = true;
        startPauseBtn.textContent = 'Continuar';
        pausasContador++; // Incrementamos el contador de pausas
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval);
    };

    const reiniciarTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval);
        isPaused = true;
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
        imagenEl.style.display = 'block';
        duracionOriginal = postura.duracionMinutos * 60;
        detallesBtn.href = `visualizarPosturas.html?posturaId=${postura.id}&dolorInicio=${dolorInicio}&index=${posturaActualIndex}`;
        reiniciarTimer();
        anteriorBtn.disabled = posturaActualIndex === 0;
        siguienteBtn.textContent = (posturaActualIndex === serie.secuencia.length - 1) ? 'Finalizar Sesión' : 'Siguiente Postura';
    };
    
    const siguientePostura = () => {
        if (!serie.secuencia || posturaActualIndex >= serie.secuencia.length - 1) return finalizarSerie();
        posturaActualIndex++;
        mostrarPostura();
    };
    
    const posturaAnterior = () => {
        if (posturaActualIndex <= 0) return;
        posturaActualIndex--;
        mostrarPostura();
    };
    
    const finalizarSerie = () => {
        if (timerInterval) clearInterval(timerInterval);
        if (tiempoEfectivoInterval) clearInterval(tiempoEfectivoInterval);

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
    startPauseBtn.addEventListener('click', () => { isPaused ? iniciarTimer() : pausarTimer(); });
    resetBtn.addEventListener('click', reiniciarTimer);
    siguienteBtn.addEventListener('click', (e) => { e.preventDefault(); siguientePostura(); });
    anteriorBtn.addEventListener('click', (e) => { e.preventDefault(); posturaAnterior(); });

    // --- INICIO DE LA CARGA DE DATOS ---
    try {
        serie = await fetchApi<Serie>('/pacientes/mi-serie');
        if (!serie?.secuencia?.length) throw new Error('No tienes una serie asignada o está vacía.');
        mostrarPostura();
    } catch (e) {
        if (e instanceof Error) {
            showToast(e.message, 'error');
            setTimeout(() => window.location.href = 'detalleSesion.html', 2000);
        }
    }
});