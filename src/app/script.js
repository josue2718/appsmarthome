let chart; // Variable para almacenar la instancia del gráfico

// Función para obtener los datos de la API
async function fetchData() {
  try {
    const response = await fetch('/datos'); // Ruta a la API
    const data = await response.json();
    console.log('Datos obtenidos:', data);

    // Llamar a la función para procesar los datos
    processData(data);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
}

// Función para procesar y mostrar los datos en la tabla y en el gráfico
function processData(data) {
  const tableBody = document.getElementById('data-table');
  const labels = [];
  const voltages = [];

  // Limpiar la tabla
  tableBody.innerHTML = '';

  // Procesar cada elemento del dataset
  data.forEach((item, index) => {
    // Agregar fila a la tabla
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.Voltaje}</td>
      <td>${item.Distancia}</td>
      <td>${item.Lectura}</td>
    `;
    tableBody.appendChild(row);

    // Agregar datos al gráfico
    labels.push(item.Distancia); // Distancia en el eje X
    voltages.push(item.Voltaje); // Voltaje en el eje Y
  });

  // Crear o actualizar el gráfico
  const ctx = document.getElementById('myChart').getContext('2d');
  if (!chart) {
    chart = new Chart(ctx, {
      type: 'line', // Tipo de gráfico
      data: {
        labels: labels, // Eje X: Distancia
        datasets: [{
          label: 'Voltaje vs Distancia',
          data: voltages, // Eje Y: Voltaje
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Distancia (CM)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Voltaje (V)'
            },
            beginAtZero: true
          }
        }
      }
    });
  } else {
    // Actualizar los datos del gráfico
    chart.data.labels = labels;
    chart.data.datasets[0].data = voltages;
    chart.update();
  }
}

// Llamar a la función fetchData al cargar la página
window.onload = function() {
fetchData(); // Llamada inicial al cargar la página
setInterval(fetchData, 1000); // Llamar a fetchData cada 1000 ms (1 segundo)
}