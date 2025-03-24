document.addEventListener("DOMContentLoaded", async () => {
    if (Notification.permission !== "granted") {
        const permiso = await Notification.requestPermission();
        if (permiso !== "granted") {
            console.log("Permiso de notificación denegado");
            return;
        }
    }

    // Cargar datos cada segundo si el permiso es concedido
    setInterval(verificarNuevaEntrada, 1000);
});

let ultimaFecha = null;

async function verificarNuevaEntrada() {
    try {
        const response = await fetch('/sensorentrada');
        if (!response.ok) throw new Error("Error al obtener datos del sensor");

        const data = await response.json();
        if (!data || data.length === 0) {
            console.log("No hay datos disponibles");
            return;
        }

        const ultimaEntrada = data[data.length - 1];
        if (!ultimaEntrada || !ultimaEntrada.fechainicio) {
            console.log("Fecha de inicio no disponible");
            return;
        }

        // Comprobar si la fecha es diferente de la última registrada
        if (ultimaFecha !== ultimaEntrada.fechainicio) {
            ultimaFecha = ultimaEntrada.fechainicio;
            mostrarNotificacion(`Nueva entrada registrada a las ${ultimaFecha}`);
        }
    } catch (error) {
        console.error("Error verificando nuevas entradas:", error);
    }
}

function mostrarNotificacion(mensaje) {
    if (Notification.permission === "granted") {
        new Notification("📢 Notificación", {
            body: mensaje,
            icon: "/icono.png"
        });
    } else {
        console.log("Notificaciones deshabilitadas.");
    }
}

