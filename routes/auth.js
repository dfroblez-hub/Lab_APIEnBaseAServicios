// Requerir dependencias necesarias
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const router = express.Router();

// Comprueba que todos los valores recibidos sean texto y no estén vacíos
function esTexto(...valores) {
  return valores.every((v) => typeof v === "string" && v.trim() !== "");
}

// Deja el correo en el mismo formato con el que se guarda (minus y sin espacios)
function normalizar(correo) {
  return correo.toLowerCase().trim();
}

// Controlador para el registro del usuario
router.post("/register", async (req, res) => {
  const { correo, contrasenia } = req.body;
  if (!esTexto(correo, contrasenia)) {
    return res
      .status(400)
      .json({ msg: "Correo y contraseña son obligatorios" });
  }

  // El correo no se puede repetir
  const existe = await Usuario.findOne({ correo: normalizar(correo) });
  if (existe) {
    return res.status(409).json({ msg: "El correo ya está registrado" });
  }

  // Cifrar la contraseña antes de guardarla
  const hash = await bcrypt.hash(contrasenia, 10);
  const usuario = await Usuario.create({ correo, contrasenia: hash });

  res.status(201).json({ msg: "Usuario registrado", id: usuario._id });
});

// Controlador para el login
router.post("/login", async (req, res) => {
  const { correo, contrasenia } = req.body;
  if (!esTexto(correo, contrasenia)) {
    return res
      .status(400)
      .json({ msg: "Correo y contraseña son obligatorios" });
  }

  const usuario = await Usuario.findOne({ correo: normalizar(correo) });
  if (!usuario || !(await bcrypt.compare(contrasenia, usuario.contrasenia))) {
    return res.status(401).json({ msg: "Credenciales inválidas" });
  }

  // Generar el token de sesión con el identificador de usuario; vence en 1 hora
  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ msg: "Login exitoso", token });
});

module.exports = router;
