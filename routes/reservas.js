// Requerir dependencias necesarias
const express = require("express");
const mongoose = require("mongoose");
const Reserva = require("../models/Reserva.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// Proteger todas las rutas siguientes con autenticación
router.use(authMiddleware);

// Busca otra reserva de la misma sala en la misma fecha y hora
function buscarChoque(sala, fecha, hora, excluirId) {
  return Reserva.findOne({ sala, fecha, hora, _id: { $ne: excluirId } });
}

// Busca la reserva del parámetro :id y comprueba que pertenezca al usuario.
// Si algo falla, responde con el error y devuelve null
async function reservaPropia(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ msg: "Id de reserva inválido" });
    return null;
  }

  const reserva = await Reserva.findById(req.params.id);
  if (!reserva) {
    res.status(404).json({ msg: "Reserva no encontrada" });
    return null;
  }

  if (reserva.usuario.toString() !== req.userId) {
    res.status(403).json({ msg: "La reserva pertenece a otro usuario" });
    return null;
  }

  return reserva;
}

// Listar todas las reservas del usuario autenticado
router.get("/", async (req, res) => {
  const reservas = await Reserva.find({ usuario: req.userId }).sort({
    fecha: 1,
    hora: 1,
  });
  res.json(reservas);
});

// Crear una nueva reserva
router.post("/", async (req, res) => {
  const { fecha, sala, hora } = req.body;
  if (
    ![fecha, sala, hora].every((v) => typeof v === "string" && v.trim() !== "")
  ) {
    return res.status(400).json({ msg: "Fecha, sala y hora son obligatorias" });
  }

  if (await buscarChoque(sala, fecha, hora)) {
    return res
      .status(409)
      .json({ msg: "La sala ya está reservada en esa fecha y hora" });
  }

  const reserva = await Reserva.create({
    usuario: req.userId,
    fecha,
    sala,
    hora,
  });
  res.status(201).json(reserva);
});

// Eliminar (cancelar) una reserva
router.delete("/:id", async (req, res) => {
  const reserva = await reservaPropia(req, res);
  if (!reserva) return;

  await reserva.deleteOne();
  res.json({ msg: "Reserva cancelada" });
});

module.exports = router;
