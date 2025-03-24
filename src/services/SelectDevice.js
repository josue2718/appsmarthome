async function getDeviceData() {
    try {
        const response = await fetch('/electrodomestico', { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        const data = await response.json();
        console.log('Datos del sensor:', data);
        return data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return []; // Devuelve un array vacío si hay error
    }
}

async function actualizarEstadoDispositivo(pin,activo) {
    try {
        const response = await fetch(`/electrodomestico/${pin}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: activo })
        });

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        console.log(`Dispositivo con pin ${pin} actualizado a activo.`);
        cargarDatosdevice(); // Recargar los dispositivos para ver cambios
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error);
    }
}

function agregarItem(tipoDispositivo, pin, activo) {
    const nuevoItem = document.createElement("div");
    nuevoItem.classList.add("item-content");

 

    const boton = document.createElement("button");
    const img = document.createElement("img");

    // Asigna la imagen según el tipo de dispositivo
    const imagenes = {
        foco: "assets/lamp-ceiling.svg",
        camara: "assets/cctv.svg"
    };

    img.src = imagenes[tipoDispositivo] || "assets/default.svg"; 
    img.alt = tipoDispositivo.charAt(0).toUpperCase() + tipoDispositivo.slice(1);

    boton.appendChild(img);

    // Evento para actualizar el estado del dispositivo al hacer clic
    boton.addEventListener("click", () =>  activo ? actualizarEstadoDispositivo(pin, false) : actualizarEstadoDispositivo(pin, true));

    const parrafo = document.createElement("p");
    parrafo.textContent = tipoDispositivo + " " + pin;

    nuevoItem.appendChild(boton);
    nuevoItem.appendChild(parrafo);
   // Si el dispositivo está activo, cambia el color de fondo
    if (activo) {
        boton.style.backgroundColor ="rgb(111, 16, 206)"; 
    }
    document.querySelector(".device-content").appendChild(nuevoItem);
}

async function cargarDatosdevice() {
    try {
        const data = await getDeviceData();
        if (!Array.isArray(data) || data.length === 0) {
            return;
        }
            
        document.querySelector(".device-content").innerHTML = ""; // Limpiar antes de agregar nuevos dispositivos

        data.forEach(device => agregarItem(device.tipo, device.pin, device.activo));
    } catch (error) {
        console.error('Error al cargar dispositivos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosdevice(); // Cargar datos una vez al inicio

    // Actualizar cada 500 ms
    setInterval(cargarDatosdevice, 500);
});
