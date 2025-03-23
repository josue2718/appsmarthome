const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Importa ObjectId
const cors = require('cors'); // Habilitamos CORS
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// URI de MongoDB, configurada para Azure o local
const uri = process.env.MONGODB_URI || 'mongodb+srv://oitjosue:iotjosue@cluster0.efnty.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware para parsear JSON
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../src')));

// Habilitar CORS para permitir solicitudes desde diferentes orígenes
app.use(cors());


// Variable para almacenar la instancia de la base de datos
let db;

// Conectar a MongoDB al iniciar la aplicación
(async () => {
  try {
    await client.connect();
    db = client.db('Casaintiligente');
    console.log('Conexión establecida con MongoDB.');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Finaliza la aplicación si no se puede conectar
  }
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/monitoreo', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/monitoreo.html'));
});

app.get('/dispositivos', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/dispositivos.html'));
});





app.get('/sensorentrada', async (req, res) => {
  try {
    const entredasCollection = db.collection('entradas');
    const entredas = await entredasCollection.find({}).toArray(); 


    res.status(200).json(entredas); // Retorna los datos como respuesta
  } catch (err) {
    console.error('Error al obtener datos de MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});


app.get('/arduino', async (req, res) => {
  try {
    const electrodomesticosCollection = db.collection('Electrodomesticos');
    const ModoCollection = db.collection('Modo'); // Si necesitas otra colección, añadir aquí.
    const focoCollection = db.collection('foco');
    const electrodomesticos = await electrodomesticosCollection.find({}).toArray();
    const Modo = await ModoCollection.find({}).toArray(); // Si es necesario, incluir los datos de arduino.
    const foco = await focoCollection.find({}).toArray(); 
    // Crear una respuesta combinada con los datos de las colecciones
    const data = {
      electrodomesticos,
      Modo,
      foco
    };

    console.log('Datos obtenidos:', data);

    res.status(200).json(data); // Retorna los datos como respuesta
  } catch (err) {
    console.error('Error al obtener datos de MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});
// Ruta para manejar la inserción de datos
app.post('/entrada', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    
    const now = new Date();
    const fechainicio = now.toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City', // Zona horaria de México
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Para obtener formato de 24 horas
    }).replace(',', ''); // Elimina la coma entre fecha y hora
    const prendido= true;

    // Insertar el documento en MongoDB
    const collection = db.collection('entradas');
    await collection.insertOne({ fechainicio});


    const collection2 = db.collection('foco');

    // Actualizar el documento existente
    const result = await collection2.updateOne({}, { $set: { prendido } });

    if (result.matchedCount === 0) {
      return res.status(404).send('No se encontró un documento para actualizar.');
    }

    console.log('Datos insertados correctamente en MongoDB.');
    res.status(200).send('Datos insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});

app.put('/electrodomestico/modo', async (req, res) => {
  try {
    const { modo, encender, apagar } = req.body;

    // Validar que las horas sean válidas si el modo es 'hora'
    if (modo === "hora" && (!encender || !apagar)) {
      return res.status(400).json({ error: "Debe especificar las horas de encendido y apagado para el modo 'hora'" });
    }

    if (!["automatico", "hora"].includes(modo)) {
      return res.status(400).json({ error: "Modo inválido" });
    }

    const collection = db.collection('Modo');

    // Obtener el documento actual
    const currentMode = await collection.findOne({});

    if (!currentMode) {
      return res.status(404).json({ error: 'Modo no encontrado en la base de datos' });
    }

    // Si el modo actual es 'automatico' y estamos cambiando a 'hora'
    if (currentMode.modo === "automatico" && modo === "hora") {
      // Validar las horas para 'hora'
      if (!encender || !apagar) {
        return res.status(400).json({ error: "Debe especificar las horas de encendido y apagado" });
      }

      const result = await collection.updateOne(
        { modo: "automatico" }, // Filtrar por 'automatico'
        { 
          $set: { 
            modo: "hora", // Cambiar el modo a 'hora'
            horario: { encender, apagar } // Actualizar las horas
          }
        }
      );

      if (result.modifiedCount > 0) {
        res.json({ mensaje: `Modo cambiado a 'hora' y horario actualizado correctamente` });
      } else {
        res.status(500).json({ error: 'No se pudo cambiar el modo y actualizar el horario' });
      }
    } 
    // Si el modo actual es 'hora' y estamos cambiando a 'automatico'
    else if (currentMode.modo === "hora" && modo === "automatico") {
      const result = await collection.updateOne(
        { modo: "hora" }, // Filtrar por 'hora'
        { 
          $set: { 
            modo: "automatico", // Cambiar el modo a 'automatico'
          }
        }
      );

      if (result.modifiedCount > 0) {
        res.json({ mensaje: `Modo cambiado a 'automatico' y horario eliminado correctamente` });
      } else {
        res.status(500).json({ error: 'No se pudo cambiar el modo a "automatico"' });
      }
    } 
    // Si el modo es 'hora' y las horas cambiaron, actualizar el horario
    else if (currentMode.modo === "hora" && modo === "hora") {
      // Verificar si las horas son diferentes
      if (
        currentMode.horario.encender !== encender || 
        currentMode.horario.apagar !== apagar
      ) {
        const result = await collection.updateOne(
          { modo: "hora" }, // Filtrar por 'hora'
          { 
            $set: { 
              horario: { encender, apagar } // Actualizar las horas
            }
          }
        );

        if (result.modifiedCount > 0) {
          res.json({ mensaje: `Horario actualizado correctamente` });
        } else {
          res.status(500).json({ error: 'No se pudo actualizar el horario' });
        }
      } else {
        res.json({ mensaje: 'Las horas no han cambiado, no es necesario actualizar' });
      }
    } 
    // Si el modo es el mismo, solo devolver un mensaje
    else {
      res.json({ mensaje: `El modo ya está configurado como '${modo}'` });
    }

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/electrodomestico/modo', async (req, res) => {
  try {
    const ModoCollection = db.collection('Modo'); 
    const Modo = await ModoCollection.find({}).toArray();
    res.status(200).json(Modo); 

  } catch (err) {
    res.status(500).json({ error: 'Error en el servido' });
  }
});

app.put('/foco', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const { prendido } = req.body; // Obtener el valor de prendido desde la solicitud

    if (typeof prendido !== 'boolean') {
      return res.status(400).send('El valor de prendido debe ser un booleano.');
    }

    const collection = db.collection('foco');

    // Actualizar el documento existente
    const result = await collection.updateOne({}, { $set: { prendido } });

    if (result.matchedCount === 0) {
      return res.status(404).send('No se encontró un documento para actualizar.');
    }

    console.log('Estado actualizado correctamente en MongoDB.');
    res.status(200).send('Estado actualizado correctamente.');
  } catch (err) {
    console.error('Error al actualizar en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});



app.get('/foco', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const focoCollection = db.collection('foco');
    const foco = await focoCollection.find({}).toArray(); 
    console.log('Datos obtenidos:', foco);

    res.status(200).json(foco); // Retorna los datos como respuesta
    
  } catch (err) {
    console.error('Error al actualizar en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});

app.get('/electrodomestico', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const electrodomesticosCollection = db.collection('Electrodomesticos');
    const electrodomesticos= await electrodomesticosCollection.find({}).toArray(); 
    console.log('Datos obtenidos:', electrodomesticos);

    res.status(200).json(electrodomesticos); // Retorna los datos como respuesta
    
  } catch (err) {
    console.error('Error al actualizar en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});

app.delete('/electrodomestico/:pin', async (req, res) => {
  const { pin } = req.params;  // Extrae el pin de la URL

  try {
    const electrodomesticosCollection = db.collection('Electrodomesticos');
    
    // Intenta eliminar el dispositivo con el pin especificado
    const result = await electrodomesticosCollection.deleteOne({ pin: pin });

    if (result.deletedCount === 0) {
      // Si no se encuentra un dispositivo con ese pin
      return res.status(404).send('Dispositivo no encontrado.');
    }

    console.log(`Dispositivo con pin ${pin} eliminado`);
    res.status(200).send('Dispositivo eliminado exitosamente.');
  } catch (err) {
    console.error('Error al eliminar dispositivo en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});

app.put('/electrodomestico/:pin', async (req, res) => {
  const { pin } = req.params;

  try {
    const { status} = req.body; // Obtener el valor de prendido desde la solicitud

    if (typeof status !== 'boolean') {
      return res.status(400).send('El valor de prendido debe ser un booleano.');
    }

      const electrodomesticosCollection = db.collection('Electrodomesticos');
      
      // Actualizar el estado a activo
      const result = await electrodomesticosCollection.updateOne(
          { pin: pin },
          { $set: { activo: status} }
      );

      if (result.matchedCount === 0) {
          return res.status(404).send('Dispositivo no encontrado.');
      }

      console.log(`Dispositivo con pin ${pin} activado.`);
      res.status(200).send('Dispositivo activado.');
  } catch (err) {
      console.error('Error al actualizar dispositivo:', err);
      res.status(500).send('Error interno del servidor.');
  }
});


app.post('/electrodomestico', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const {tipo, nombre, activo,pin } = req.body; // Extraer los valores de req.body

    // Validar que 'nombre' no esté vacío
    if (!nombre) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
    }

    if (activo === undefined || typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo "activo" es obligatorio y debe ser un booleano (true o false).' });
    }

    // Insertar el documento en MongoDB
    const collection = db.collection('Electrodomesticos');
    await collection.insertOne({ nombre,activo,pin,tipo });

    console.log('Datos insertados correctamente en MongoDB.');
    res.status(201).json({ mensaje: 'Datos insertados correctamente.' });
  } catch (err) {
    console.error('Error al insertar en MongoDB:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});


app.put('/electrodomestico/prendido', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const { nombres, prendido } = req.body; // Extraer nombres y estado de prendido

    // Validar que nombres sea un array no vacío
    if (!Array.isArray(nombres) || nombres.length === 0) {
      return res.status(400).json({ error: 'El campo "nombres" debe ser un array con al menos un nombre.' });
    }

    // Validar que prendido sea un booleano
    if (typeof prendido !== 'boolean') {
      return res.status(400).json({ error: 'El campo "prendido" debe ser un booleano (true o false).' });
    }

    const collection = db.collection('Electrodomesticos');

    // Actualizar todos los electrodomésticos cuyos nombres estén en la lista
    const result = await collection.updateMany(
      { nombre: { $in: nombres } },  // Filtra los documentos con nombres en la lista
      { $set: { prendido } }         // Actualiza el estado de prendido
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No se encontraron electrodomésticos para actualizar.' });
    }

    console.log(`Se actualizaron ${result.modifiedCount} electrodomésticos.`);
    res.status(200).json({ mensaje: `Se actualizaron ${result.modifiedCount} electrodomésticos correctamente.` });

  } catch (err) {
    console.error('Error al actualizar en MongoDB:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.put('/electrodomestico/activo', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const { nombres, activo } = req.body; // Extraer nombres y estado activo

    // Validar que activo sea un booleano
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo "activo" debe ser un booleano (true o false).' });
    }

    const collection = db.collection('Electrodomesticos');

    if (!Array.isArray(nombres) || nombres.length === 0) {
      // Si no se envía ningún nombre, poner TODOS en false
      const resultAllOff = await collection.updateMany({}, { $set: { activo: false } });

      console.log(`Se desactivaron ${resultAllOff.modifiedCount} electrodomésticos.`);
      return res.status(200).json({
        mensaje: `Se desactivaron ${resultAllOff.modifiedCount} electrodomésticos porque no se enviaron nombres.`
      });
    }

    // Actualizar los electrodomésticos en la lista con el estado recibido
    const resultOn = await collection.updateMany(
      { nombre: { $in: nombres } },
      { $set: { activo } }
    );

    // Actualizar los electrodomésticos que NO están en la lista a activo: false
    const resultOff = await collection.updateMany(
      { nombre: { $nin: nombres } },  // Filtrar los que NO están en la lista
      { $set: { activo: false } }
    );

    console.log(`Se actualizaron ${resultOn.modifiedCount} electrodomésticos a ${activo}.`);
    console.log(`Se desactivaron ${resultOff.modifiedCount} electrodomésticos.`);

    res.status(200).json({
      mensaje: `Se actualizaron ${resultOn.modifiedCount} electrodomésticos a ${activo}, y ${resultOff.modifiedCount} se desactivaron.`
    });

  } catch (err) {
    console.error('Error al actualizar en MongoDB:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Ruta para obtener datos desde MongoDB
app.get('/datos', async (req, res) => {
  try {
    const collection = db.collection('db');
    const datosensor = await collection.find({}).toArray();

    console.log('Datos obtenidos:', datosensor);
    res.status(200).json(datosensor);
  } catch (err) {
    console.error('Error al obtener datos de MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});


// Ruta para eliminar un documento por su ID
app.delete('/eliminar/:id', async (req, res) => {
  try {
    const collection = db.collection('db');
    const id = req.params.id;

    // Convertir el ID en un ObjectId para que MongoDB lo reconozca
    const objectId = new ObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      console.log(`Documento con ID ${id} eliminado correctamente.`);
      res.status(200).send(`Documento con ID ${id} eliminado correctamente.`);
    } else {
      console.log(`No se encontró documento con ID ${id}.`);
      res.status(404).send(`No se encontró documento con ID ${id}.`);
    }
  } catch (err) {
    console.error('Error al eliminar documento en MongoDB:', err);
    res.status(500).send('Error al eliminar documento en MongoDB.');
  }
});

// Cerrar la conexión cuando se detenga la aplicación
process.on('SIGINT', async () => {
  console.log('Cerrando conexión con MongoDB.');
  await client.close();
  process.exit(0);
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
