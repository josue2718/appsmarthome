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

// Ruta para manejar la inserción de datos
app.post('/insertar', async (req, res) => {
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
    const entrada= true;

    // Insertar el documento en MongoDB
    const collection = db.collection('entradas');
    await collection.insertOne({ fechainicio ,entrada});

    console.log('Datos insertados correctamente en MongoDB.');
    res.status(200).send('Datos insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
  }
});


app.post('/insertartipo', async (req, res) => {
  console.log('Datos recibidos:', req.body);

  try {
    const { nombre } = req.body; // Extraer nombre de req.body

    if (!nombre) {
      return res.status(400).send('El campo "nombre" es obligatorio.');
    }

    // Insertar el documento en MongoDB
    const collection = db.collection('Electrodomesticos');
    await collection.insertOne({ nombre });

    console.log('Datos insertados correctamente en MongoDB.');
    res.status(200).send('Datos insertados correctamente.');
  } catch (err) {
    console.error('Error al insertar en MongoDB:', err);
    res.status(500).send('Error interno del servidor.');
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

/*app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});*/

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
