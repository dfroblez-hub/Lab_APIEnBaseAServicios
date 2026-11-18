// Requerir dependencias necesarias
const jwt = require("jsonwebtoken");

// Middleware que protege las rutas usando JWT
function authMiddleware(req, res, next) {
  // Extraer el token del header -> Authorization: Bearer <token>
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "No autorizado" });
  }

  try {
    // Verificar y decodificar el token
    // Si la firma no coincide o el token expiró, jwt.verify lanza un error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Almacenar el id del user autenticado en la petición
    next(); // Permite continuar con la siguiente función
  } catch {
    return res.status(403).json({ msg: "Token inválido" });
  }
}

// Exportar la función del middleware
module.exports = authMiddleware;
