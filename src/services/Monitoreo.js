async function getSensorData() {
    const url = '/sensorentrada';
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error al obtener los datos: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('Datos del sensor:', data);
      return data;
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }


  function agregarNotificacion(mensaje) {
    const notifyContainer = document.getElementById("notifyContainer");

    const nuevaNotificacion = document.createElement("div");
    nuevaNotificacion.className = "notificacion";

    const textoCompleto = document.createElement("span");
    textoCompleto.textContent = mensaje;
    textoCompleto.className = "texto-completo";
    nuevaNotificacion.appendChild(textoCompleto);

    const textoTruncado = mensaje.length > 60 ? mensaje.slice(0, 57) + "..." : mensaje;
    const textoVisible = document.createElement("span");
    textoVisible.textContent = textoTruncado;
    textoVisible.className = "texto-visible";
    nuevaNotificacion.appendChild(textoVisible);

    nuevaNotificacion.addEventListener("click", () => {
      const esExpandida = nuevaNotificacion.classList.toggle("expandida");
      textoVisible.style.display = esExpandida ? "none" : "inline";
      textoCompleto.style.display = esExpandida ? "inline" : "none";
    });

    textoCompleto.style.display = "none";
    notifyContainer.appendChild(nuevaNotificacion);
  }

  async function cargarDatosSensor() {
    try {
      const data = await getSensorData();
      if (!data) {
        agregarNotificacion('No hay datos disponibles del sensor.');
        return;
      }

      // Si la respuesta es un array, tomar el primer objeto
      const sensorData = Array.isArray(data) && data.length > 0 ? data[0] : data;

      // Validar si existe la propiedad fechainicio
      if (!sensorData.fechainicio) {
        agregarNotificacion('Fecha de inicio no disponible.');
        return;
      }

      // Extraer y formatear la fecha
      const fechaPartes = sensorData.fechainicio.split(' ')[0].split('/');
      const fecha = new Date(fechaPartes[2], fechaPartes[1] - 1, fechaPartes[0]);

      const formatoFecha = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(fecha);

      // Mostrar solo la fecha en la UI
      agregarNotificacion(`Fecha de Inicio: ${formatoFecha}`);
    } catch (error) {
      console.error('Error al obtener los datos del sensor:', error);
      agregarNotificacion('Error al obtener los datos del senso.');
    }
  }

  document.addEventListener('DOMContentLoaded', cargarDatosSensor);
