document.addEventListener("DOMContentLoaded", async () => {
    const toggleButton = document.getElementById("toggleButton");
    const toggleImage = document.getElementById("toggleImage");
    const toggleText = document.getElementById("toggleText");

    await getfocoData(); // Obtener estado inicial

    toggleButton.addEventListener("click", async () => {
        try {
            const data = await getfocoData(); 
            const nuevoEstado = !data[0].prendido;

            await fetch("/foco", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prendido: nuevoEstado })
            });

            getfocoData(); // Actualizar la interfaz después del cambio
        } catch (error) {
            console.error("Error al actualizar el estad:", error);
        }
    });
});

async function getfocoData() {
    try {
        const response = await fetch("/foco");
        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        const data = await response.json();
        const { prendido } = data[0];

        toggleImage.src = prendido ? "assets/ON.svg" : "assets/OFF.svg";
        toggleText.textContent = prendido ? "Encendido" : "Apagado";
        toggleText.style.color = prendido ? "#FFE6C9" : ""; 

        return data;
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}
