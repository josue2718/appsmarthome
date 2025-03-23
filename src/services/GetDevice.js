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

function agregarItem(tipoDispositivo, pin) {
    const nuevoItem = document.createElement("div");
    nuevoItem.classList.add("item-content");

    const boton = document.createElement("button");
    const img = document.createElement("img");

    // Asigna la imagen según el tipo de dispositivo
    const imagenes = {
        foco: "assets/lamp-ceiling.svg",
        camara: "assets/cctv.svg"
    };

    img.src = imagenes[tipoDispositivo] || "assets/default.svg"; // Imagen por defecto
    img.alt = tipoDispositivo.charAt(0).toUpperCase() + tipoDispositivo.slice(1);

    boton.appendChild(img);

    // Agregar funcionalidad de eliminar con confirmación de modal
    boton.addEventListener("click", () => mostrarModalConfirmacion(pin));

    const parrafo = document.createElement("p");
    parrafo.textContent = tipoDispositivo + " " + pin;

    nuevoItem.appendChild(boton);
    nuevoItem.appendChild(parrafo);

    document.querySelector(".device-content").appendChild(nuevoItem);
}

// Mostrar modal de confirmación
function mostrarModalConfirmacion(pin) {
    // Crear un modal de confirmación
    const modal = document.createElement("div");
    modal.classList.add("modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const mensaje = document.createElement("p");
    mensaje.textContent = "¿Estás seguro de que quieres eliminar este dispositivo?";
    
    const botones = document.createElement("div");
    botones.classList.add("modal-buttons");

    const botonCancelar = document.createElement("button");
    botonCancelar.textContent = "Cancelar";
    botonCancelar.addEventListener("click", () => cerrarModal(modal));

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => eliminarDispositivo(pin, modal));

    botones.appendChild(botonCancelar);
    botones.appendChild(botonEliminar);

    modalContent.appendChild(mensaje);
    modalContent.appendChild(botones);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

// Cerrar modal
function cerrarModal(modal) {
    document.body.removeChild(modal);
}

// Función para eliminar el dispositivo
async function eliminarDispositivo(pin, modal) {
    try {
        const response = await fetch(`/electrodomestico/${pin}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert(`Dispositivo con pin ${pin} eliminado correctamente.`);
            window.location.reload(); // Recargar la página para ver el nuevo dispositivo
            cerrarModal(modal);
        } else {
            console.error(`Error al eliminar el dispositivo con pin ${pin}.`);
            cerrarModal(modal);
        }
    } catch (error) {
        console.error('Error al eliminar dispositivo:', error);
        cerrarModal(modal);
    }
}

async function cargarDatosdevice() {
    try {
        const data = await getDeviceData();
        if (!Array.isArray(data) || data.length === 0) {
            return;
        }

        data.forEach(device => agregarItem(device.tipo, device.pin)); // Agregar cada dispositivo
    } catch (error) {
        console.error('Error al cargar dispositivos:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarDatosdevice);
