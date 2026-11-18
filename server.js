// Requerir dependencias necesarias
require("dotenv").config(); // Cargar las variables de entorno
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
//
//

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS y permitir parseo de JSON
app.use(cors());
app.use(express.json());

// Cualquier otra ruta responde 404 en formato JSON
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

// Manejo centralizado de errores (Express lo reconoce por tener 4 params)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ msg: "El cuerpo de la petición no es un JSON válido" });
  }
  if (err.name === "ValidationError") {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ msg: mensajes.join(". ") });
  }
  if (err.code === 11000) {
    return res.status(409).json({ msg: "El correo ya está registrado" });
  }
  console.error(err);
  res.status(500).json({ msg: "Error interno del servidor" });
});

// Conectar la base de datos
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo DB conectado");
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("No se pudo conectar a MongoDB:", err.message));
