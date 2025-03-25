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

    const parrafo = document.createElement("p");
    parrafo.textContent = tipoDispositivo + " " + pin;

    // Agrega la imagen y el párrafo al botón
    boton.appendChild(img);
    boton.appendChild(parrafo); 
    
    // Evento para actualizar el estado del dispositivo al hacer clic
    boton.addEventListener("click", () =>  
        activo ? actualizarEstadoDispositivo(pin, false) : actualizarEstadoDispositivo(pin, true)
    );

    nuevoItem.appendChild(boton);

    // Si el dispositivo está activo, cambia el color de fondo
    if (activo) {
        boton.style.border = "1px solid rgb(255, 156, 164)"; 
        parrafo.style.color = "rgb(245, 189, 220)"
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

document.addEventListener('DOMContentLoaded', cargarDatosdevice);
