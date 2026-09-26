# Copart Auctions API

API REST de subastas de vehiculos construida con NestJS, Firebase Authentication y Firebase Realtime Database. Requiere Node.js 22 y un proyecto Firebase con Email/Password habilitado y Realtime Database creada.

## Instalacion

```bash
cd backend
npm install
copy .env.example .env
```

Complete `.env` con las credenciales de una cuenta de servicio de Firebase y la clave web API del proyecto. No agregue este archivo ni archivos JSON de cuentas de servicio al repositorio.

```env
PORT=3000
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=
FIREBASE_WEB_API_KEY=
FRONTEND_URL=http://localhost:5173
```

`FIREBASE_PRIVATE_KEY` puede guardarse en una sola linea usando `\n` para los saltos de linea.

## Vercel

Al importar el repositorio en Vercel, configure `backend` como **Root Directory**. La funcion serverless esta en `api/index.ts` y `vercel.json` usa Node.js 22. Cargue las mismas variables de `.env` en **Settings > Environment Variables**; nunca suba credenciales al repositorio. Configure `FRONTEND_URL` con el dominio final del frontend cuando este exista.

## Comandos

```bash
npm run start:dev
npm run build
npm run start:prod
npm run seed:demo
```

El seed crea de forma idempotente `demo1@copart.test`, `demo2@copart.test` y `demo3@copart.test`; todas usan la contrasena `Demo1234!`.

## Endpoints

| Metodo | Ruta | Autenticacion |
| --- | --- | --- |
| GET | `/api/health` | No |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/vehicles` | No |
| GET | `/api/vehicles/mine` | Si |
| GET | `/api/vehicles/:id` | No |
| POST | `/api/vehicles` | Si |
| PUT | `/api/vehicles/:id` | Si, propietario |
| GET | `/api/auctions/:id` | No |
| POST | `/api/auctions/:id/bids` | Si |
| GET | `/api/auctions/:id/my-status` | Si |

El catalogo acepta los filtros opcionales `year`, `brand`, `model`, `fuelType`, `damageLevel` y `drivetrain`.

## Autenticacion

Registro:

```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"firstName\":\"Maria\",\"lastName\":\"Lopez\",\"email\":\"maria@example.com\",\"phone\":\"55555555\",\"password\":\"Demo1234!\"}"
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"maria@example.com\",\"password\":\"Demo1234!\"}"
```

Las respuestas incluyen `idToken`. En rutas protegidas envie `Authorization: Bearer <idToken>`.
