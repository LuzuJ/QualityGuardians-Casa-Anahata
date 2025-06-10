document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const dolorInicio = (document.querySelector<HTMLSelectElement>('#dolorInicio'))?.value;
        if (!dolorInicio) return alert('Selecciona tu nivel de molestia.');
        window.location.href = `ejecucionSerie.html?dolorInicio=${dolorInicio}`;
    });
});