function aplicarHorario() {
    // Obtener los valores de los campos
    let horaInicio = document.getElementById("hora-inicio").value;
    let minutoInicio = document.getElementById("minuto-inicio").value;
    let periodoInicio = document.getElementById("periodo-inicio").value;
    
    let horaFinal = document.getElementById("hora-final").value;
    let minutoFinal = document.getElementById("minuto-final").value;
    let periodoFinal = document.getElementById("periodo-final").value;

    // Función para convertir la hora de formato AM/PM a formato 24 horas
    function convertirAHora24(hora, minuto, periodo) {
        hora = parseInt(hora);
        minuto = parseInt(minuto);
        
        // Ajustar el formato de 12 horas a 24 horas
        if (periodo === "AM" && hora === 12) {
            hora = 0; // La medianoche es 00:00
        } else if (periodo === "PM" && hora !== 12) {
            hora += 12; // Convertir PM (12 PM es 12:00, pero 1 PM es 13:00, etc.)
        }
        
        return { hora: hora, minuto: minuto };
    }

    // Convertir hora de inicio
    let inicio = convertirAHora24(horaInicio, minutoInicio, periodoInicio);
    let fin = convertirAHora24(horaFinal, minutoFinal, periodoFinal);
    
    // Crear objetos Date para representar las horas en formato de 24 horas
    let horaInicioFinal = new Date();
    horaInicioFinal.setHours(inicio.hora, inicio.minuto);

    let horaFinalFinal = new Date();
    horaFinalFinal.setHours(fin.hora, fin.minuto);

    // Mostrar las horas transformadas
    console.log("Hora de inicio: " + horaInicioFinal.toLocaleTimeString());
    console.log("Hora de finalización: " + horaFinalFinal.toLocaleTimeString());
}
