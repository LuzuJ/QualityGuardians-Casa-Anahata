document.addEventListener('DOMContentLoaded', () => {
    const regresarBtn = document.getElementById('regresar-btn') as HTMLAnchorElement;
    if (!regresarBtn) return;

    // Leemos los parámetros de la URL actual para saber a dónde volver
    const urlParams = new URLSearchParams(window.location.search);
    const dolorInicio = urlParams.get('dolorInicio');
    const index = urlParams.get('index');
    const tiempo = urlParams.get('tiempo');
    const pausado = urlParams.get('pausado');

    // Construimos la URL de regreso con todos los datos para restaurar el estado
    if (dolorInicio && index) {
        regresarBtn.href = `ejecucionSerie.html?dolorInicio=${dolorInicio}&index=${index}&tiempo=${tiempo}&pausado=${pausado}`;
    } else {
        // Si no hay parámetros, volvemos al inicio de la ejecución
        regresarBtn.href = 'ejecutarSesion.html';
    }
});