async function getSensorData() {
  const url = '/sensorentrada';

  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
          throw new Error(`Error al obtener los datos: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos del sensor:', data);
      return data;
  } catch (error) {
      console.error('Error en la solicitud:', error);
      return [];
  }
}

// Función para mostrar las notificaciones con íconos y actualizar la UI
function mostrarNotificaciones(datos) {
  const notifyContainer = document.getElementById("notifyContainer");
  notifyContainer.innerHTML = ""; // Limpiar notificaciones anteriores

  datos.forEach(sensor => {
      const notificacion = document.createElement("div");
      notificacion.className = "notificacion";

      const icono = document.createElement("img");
      icono.className = "icono";

      const texto = document.createElement("span");
      texto.textContent = `Fecha: ${sensor.fechainicio}`;
      texto.className = "texto";

      
      notificacion.appendChild(icono);
      notificacion.appendChild(texto);
      notifyContainer.appendChild(notificacion);
  });
}

// Función que obtiene los datos y los actualiza en la UI
async function actualizarDatosSensor() {
  const datos = await getSensorData();
  
  if (Array.isArray(datos) && datos.length > 0) {
      mostrarNotificaciones(datos);
  } else {
      mostrarNotificaciones([{ fechainicio: "No hay datos disponibles" }]);
  }
}

// Llamar a la función cada 500ms
document.addEventListener('DOMContentLoaded', () => {
  actualizarDatosSensor(); // Llamado inicial
  setInterval(actualizarDatosSensor, 1000); // Actualización cada 500ms
});
