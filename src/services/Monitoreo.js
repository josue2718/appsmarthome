async function getSensorData() {
    const url = 'https://appsmarthome.azurewebsites.net/sensorentrada';
  
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