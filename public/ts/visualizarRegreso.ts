/**
 * Script para la página de visualización de postura con funcionalidad de regreso
 * @description Maneja la navegación de regreso a la sesión de ejercicios preservando el estado completo
 */

/**
 * Inicialización del script de regreso a sesión
 * @description Event listener que configura la URL de regreso con todos los parámetros de estado
 * @param {Event} event - Evento DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const regresarBtn = document.getElementById('regresar-btn') as HTMLAnchorElement;
    if (!regresarBtn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const index = urlParams.get('index');
    const tiempo = urlParams.get('tiempo');
    const pausado = urlParams.get('pausado');
    const pausasCount = urlParams.get('pausasCount');
    const tiempoEfectivo = urlParams.get('tiempoEfectivo');
    const horaInicio = urlParams.get('horaInicio');

    if (dolorInicio && index) {
        regresarBtn.href = `ejecucionSerie.html?dolorInicio=${dolorInicio}&index=${index}&tiempo=${tiempo}&pausado=${pausado}&pausasCount=${pausasCount}&tiempoEfectivo=${tiempoEfectivo}&horaInicio=${horaInicio}`;
    } else {
        regresarBtn.href = 'ejecutarSesion.html';
    }
});