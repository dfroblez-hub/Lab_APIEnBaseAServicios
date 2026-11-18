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

// Actividad 1: Recuperación de contraseña simulada, no envía correos reales
router.post("/recover", async (req, res) => {
  const { correo } = req.body;
  if (!esTexto(correo)) {
    return res.status(400).json({ msg: "El correo es obligatorio" });
  }

  // Validar que el correo exista
  const usuario = await Usuario.findOne({ correo: normalizar(correo) });
  if (!usuario) {
    return res.status(404).json({ msg: "No existe un usuario con ese correo" });
  }

  // Token temporal de 15 minutos. Se firma con el secreto más la contraseña cifrada
  // actual, así no sirve como token de sesión y deja de valer cuando la contraseña cambia
  const tokenRecuperacion = jwt.sign(
    { id: usuario._id },
    process.env.JWT_SECRET + usuario.contrasenia,
    { expiresIn: "15m" },
  );

  // Simulación del correo -> Se devuelve el mensaje que recibiría el usuario
  res.json({
    msg: `Se envió un enlace de recuperación a ${usuario.correo}`,
    tokenRecuperacion,
    expiraEn: "15 minutos",
  });
});

// Cambiar la contraseña con el token de recuperación
router.post("/reset", async (req, res) => {
  const { tokenRecuperacion, nuevaContrasenia } = req.body;
  if (!esTexto(tokenRecuperacion, nuevaContrasenia)) {
    return res
      .status(400)
      .json({ msg: "Token y nueva contraseña son obligatorios" });
  }

  // Leer el id sin verificar todavía, para saber con qué contraseña se firmó
  const datos = jwt.decode(tokenRecuperacion);
  const usuario =
    datos && mongoose.isValidObjectId(datos.id)
      ? await Usuario.findById(datos.id)
      : null;
  if (!usuario) {
    return res.status(400).json({ msg: "Token inválido o expirado" });
  }

  // Ahora sí, verificar la firma y la expiración
  try {
    jwt.verify(tokenRecuperacion, process.env.JWT_SECRET + usuario.contrasenia);
  } catch {
    return res.status(400).json({ msg: "Token inválido o expirado" });
  }

  usuario.contrasenia = await bcrypt.hash(nuevaContrasenia, 10);
  await usuario.save();

  res.json({ msg: "Contraseña actualizada. Ya puedes iniciar sesión" });
});

module.exports = router;
