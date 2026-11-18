// Requerir dependencias necesarias
const mongoose = require("mongoose");

// Definir el esquema del usuario
const usuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true, // dos usuarios no pueden tener el mismo correo
    lowercase: true, // se guarda siempre en minus
    trim: true, // sin espacios al inicio ni al final
  },
  contrasenia: {
    type: String,
    required: [true, "La contraseña es obligatoria"], // Se guarda cifrada con bcrypt
  },
});

// Exportar el modelo del usuario
module.exports = mongoose.model("Usuario", usuarioSchema);
