document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.querySelector(".add-btn button");

    addButton.addEventListener("click", async function () {
        const nombre = document.querySelector(".nombre input").value.trim();
        const tipoDispositivo = document.querySelector("#tipoDispositivo").value;
        const pin = Math.floor(Math.random() * 100); // Simulación de un pin
        
        if (!nombre) {
            alert("Por favor, ingrese un nombre para el dispositivo.");
            return;
        }

        const data = {
            nombre: nombre,
            activo: false, // Inicialmente el dispositivo está apagado
            pin: pin
        };

        try {
            const response = await fetch("http://localhost:3000/electrodomestico", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert("Dispositivo agregado exitosamente");
                window.location.reload(); // Recargar la página para ver el nuevo dispositivo
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error al enviar la petición:", error);
            alert("Hubo un problema al agregar el dispositivo.");
        }
    });
});
