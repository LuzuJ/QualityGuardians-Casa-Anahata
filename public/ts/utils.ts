export function showToast(message: string, type: 'success' | 'error' = 'success') {    let container = document.getElementById('toast-container');
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