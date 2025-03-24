async function getmodoData() {
    try {
        const response = await fetch('/electrodomestico/modo', { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        const data = await response.json();
        console.log('Datos del sensor:', data);

        const { modo, horario } = data[0]; // Extrae el modo y horario

        // Asignar valores a los inputs y párrafos
        document.getElementById("encender-time").value = horario.encender || "00:00";
        document.getElementById("apagar-time").value = horario.apagar || "00:00";
        document.getElementById("prender-time").textContent = horario.encender || "00:00";
        document.getElementById("apagar-time").textContent = horario.apagar || "00:00";

        // Actualizar la interfaz según el modo
        actualizarModoUI(modo);

        return data;
    } catch (error) {
        console.error('Error en la solicitud:', error);
        return null;
    }
}

// **Función para actualizar la interfaz según el modo**
function actualizarModoUI(modo) {
    const checkbox = document.getElementById("automatico");
    const modoTexto = document.getElementById("modo");
    const horaConfig = document.getElementById("hora-config");

    if (modo === "automatico") {
        checkbox.checked = true;
        modoTexto.textContent = "Modo Automático";
        horaConfig.style.display = "none"; // Ocultar configuración de horas
    } else if (modo === "hora") {
        checkbox.checked = false;
        modoTexto.textContent = "Modo por Hora";
        horaConfig.style.display = "block"; // Mostrar configuración de horas
    }
}

// **Evento para cambiar el modo**
document.getElementById("automatico").addEventListener("click", function () {
    const checkbox = document.getElementById("automatico"); 

    if (checkbox.checked) {
        actualizarmodo(); // Activar modo automático
    } else {
        mostrarModalConfirmacion(); // Mostrar confirmación antes de cambiar a "hora"
    }
});

// **Función para mostrar el modal antes de cambiar a "Modo por Hora"**
function mostrarModalConfirmacion() {
    const modal = document.getElementById("modal-confirmacion");
    modal.style.display = "block"; // Mostrar modal

    document.getElementById("confirmar-cambio").onclick = function () {
        modal.style.display = "none"; // Ocultar modal
        actualizarmodohora();
    };

    document.getElementById("cancelar-cambio").onclick = function () {
        modal.style.display = "none"; // Ocultar modal
        document.getElementById("automatico").checked = true; // Mantener en modo automático
    };
}

// **Función para cambiar a modo automático**
async function actualizarmodo() {
    try {
        const response = await fetch(`/electrodomestico/modo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modo: "automatico" })
        });

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);
        
        await getmodoData(); // Recargar el estado sin refrescar la página
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error);
    }
}

// **Función para cambiar a modo por hora**
async function actualizarmodohora() {
    const encenderHora = document.getElementById("encender-time").value;
    const apagarHora = document.getElementById("apagar-time").value;

    try {
        const response = await fetch(`/electrodomestico/modo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({     
                modo: "hora",
                encender: encenderHora,
                apagar: apagarHora
            })
        });

        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);
        
        await getmodoData(); // Recargar el estado sin refrescar la página
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error);
    }
}

// **Llamar la función al cargar la página**
document.addEventListener('DOMContentLoaded', getmodoData);
