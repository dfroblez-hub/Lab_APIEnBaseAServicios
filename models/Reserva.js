// Requerir dependencias necesarias
const mongoose = require("mongoose");

// Definir el esquema de la reserva
const reservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario", // referencia al usuario dueño de la reserva
    required: [true, "La reserva debe pertenecer a un usuario"],
  },
  fecha: {
    type: String,
    required: [true, "La fecha es obligatoria"],
    match: [/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD"],
  },
  sala: {
    type: String,
    required: [true, "La sala es obligatoria"],
    trim: true,
  },
  hora: {
    type: String,
    required: [true, "La hora es obligatoria"],
    match: [
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "La hora debe tener el formato HH:MM (24 horas)",
    ],
  },
});

// Exportar el modelo de la reserva
module.exports = mongoose.model("Reserva", reservaSchema);
