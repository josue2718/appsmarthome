document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleButton");
    const toggleImage = document.getElementById("toggleImage");
    const toggleText = document.getElementById("toggleText");

    let isOn = false;

    toggleButton.addEventListener("click", async () => {
        isOn = !isOn;

        try {
            const response = await fetch("/foco", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prendido: isOn })
            });

            if (!response.ok) {
                throw new Error("Error en la actualización");
            }

            // Si la petición es exitosa, actualizamos la interfaz
            toggleImage.src = isOn ? "assets/ON.svg" : "assets/OFF.svg";
            toggleText.textContent = isOn ? "Encendido" : "Apagado";
            toggleText.style.color = isOn ? "#FFE6C9" : ""; 

            console.log("Estado actualizado correctamente en MongoDB.");
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
        }
    });
});
