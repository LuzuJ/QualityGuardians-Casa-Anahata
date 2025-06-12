import { fetchApi } from "./api";
import { showToast } from "./utils";
import type { Postura } from "./types";

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector<HTMLFormElement>('.formulario');
    const tipoTerapiaSelect = document.querySelector<HTMLSelectElement>('#tipoTerapia');
    const posturasContainer = document.querySelector<HTMLDivElement>('#listaPosturas');
    const addPosturaBtn = document.querySelector<HTMLButtonElement>('fieldset button');
    if (!form || !tipoTerapiaSelect || !posturasContainer || !addPosturaBtn) return;
    
    let todasLasPosturas: Postura[] = [];
    try {
        todasLasPosturas = await fetchApi<Postura[]>('/posturas');
    } catch (e) {
        if (e instanceof Error) showToast(`Error al cargar posturas: ${e.message}`, 'error');
    }

    const populatePosturaSelect = (select: HTMLSelectElement, posturas: Postura[]) => {
        select.innerHTML = '<option value="">Selecciona una postura</option>';
        posturas.forEach(p => select.add(new Option(p.nombre, p.id)));
    };
    
    tipoTerapiaSelect.addEventListener('change', () => {
        const terapia = tipoTerapiaSelect.value;
        const posturasFiltradas = todasLasPosturas.filter(p => p.tipoTerapias.includes(terapia));
        const primerSelect = posturasContainer.querySelector<HTMLSelectElement>('select[name="posturas[]"]');
        if (primerSelect) {
            populatePosturaSelect(primerSelect, posturasFiltradas);
            addPosturaBtn.disabled = false;
        }
    });

    addPosturaBtn.addEventListener('click', () => {
        const nuevoItem = posturasContainer.firstElementChild?.cloneNode(true) as HTMLElement;
        const input = nuevoItem.querySelector<HTMLInputElement>('input[type="number"]');
        if (input) input.value = '1';
        posturasContainer.appendChild(nuevoItem);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const secuencia = (formData.getAll('posturas[]') as string[]).map((id, index) => ({
            idPostura: id,
            duracionMinutos: parseInt(formData.getAll('duracion[]')[index] as string, 10)
        }));
        
        const datosSerie = {
            nombre: formData.get('nombreSerie') as string,
            tipoTerapia: formData.get('tipoTerapia') as string,
            sesionesRecomendadas: parseInt(formData.get('numSesiones') as string, 10),
            posturas: secuencia
        };
        
        try {
            await fetchApi('/series', { method: 'POST', body: JSON.stringify(datosSerie) });
            showToast('Serie creada con éxito', 'success');
            form.reset();
        } catch (error) {
            if (error instanceof Error) showToast(`Error: ${error.message}`, 'error');
        }
    });
});