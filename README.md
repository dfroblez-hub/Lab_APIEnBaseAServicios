# API de reservas de salas

API RESTful para registrar usuarios y gestionar reservas de salas, con autenticación mediante JWT y persistencia en MongoDB.
Laboratorio 3 de Aplicaciones Distribuidas (ESPE, NRC 37869).

## Tecnologías

Node.js, Express, MongoDB con Mongoose, JSON Web Token, bcryptjs, dotenv y cors.

## Requisitos

- Node.js 20 o superior
- MongoDB en ejecución en `localhost:27017`

## Instalación

```bash
npm install
```

Copia `.env.example` como `.env` y completa los valores.

```text
MONGO_URI=mongodb://localhost:27017/reservas
JWT_SECRET=reemplazar_por_clave_secreta_larga
PORT=3000
```

## Ejecución

```bash
npm start
```

El servidor queda disponible en `http://localhost:3000`.

## Rutas

Las rutas de `/api/reservas` requieren el encabezado `Authorization: Bearer <token>`, con el token que devuelve el login.

| Método | Ruta                 | Descripción                                            |
| ------ | -------------------- | ------------------------------------------------------ |
| POST   | `/api/auth/register` | Registrar un usuario                                   |
| POST   | `/api/auth/login`    | Iniciar sesión y obtener el token                      |
| POST   | `/api/auth/recover`  | Solicitar un token de recuperación de contraseña       |
| POST   | `/api/auth/reset`    | Restablecer la contraseña con el token de recuperación |
| GET    | `/api/reservas`      | Listar las reservas del usuario                        |
| POST   | `/api/reservas`      | Crear una reserva                                      |
| PUT    | `/api/reservas/:id`  | Editar una reserva propia                              |
| DELETE | `/api/reservas/:id`  | Cancelar una reserva propia                            |

## Pruebas

Importa en Postman la colección `postman/API Biblioteca.postman_collection.json`, ejecuta primero _Registro de Usuario_ y _Login de Usuario_, y después las peticiones de reservas.

## Estructura

```text
middleware/   Verificación del token JWT
models/       Esquemas de Usuario y Reserva
routes/       Rutas de autenticación y de reservas
postman/      Colección de pruebas
server.js     Configuración de Express y conexión a MongoDB
```

## Autor

Diego Roblez Espinoza
