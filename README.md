# 🎌 YumeTrack

YumeTrack YumeTrack es una app web full stack de anime/manga orientada a tracking personal y capa social (estilo Letterboxd para anime/manga).

El proyecto está cerrado como **MVP social de portfolio**: permite descubrir títulos, gestionar listas, escribir reseñas e interactuar con otros usuarios.

---

## ✅ Estado del proyecto

**Terminado (MVP)**

Incluye:

- Autenticación JWT (registro/login) con sesión persistente.
- Rutas protegidas.
- Perfil privado y público.
- Seguidores/seguidos (follow/unfollow).
- Búsqueda y catálogo de anime/manga con Kitsu.
- Lista personal (estado, progreso, score, favorito, notas/reseña).
- Feed social global y de seguidos.
- Likes y comentarios en reseñas.
- Notificaciones (follow + comentarios en reseña).
- UX final de cierre: loaders/skeletons, empty states y timestamps relativos.

---

## 🧱 Stack técnico

### Frontend

- React
- Tailwind CSS
- Axios
- React Router

### Datos

- PostgreSQL
- Entity Framework Core

### Integraciones

- Kitsu API (anime/manga)
- API de traducción DeepL (para traducir sinopsis automáticamente a español)

---

## 🗂️ Estructura del repositorio

```txt
YumeTrack/
├─ backend/
│  ├─ YumeTrack.API/
│  ├─ YumeTrack.Application/
│  ├─ YumeTrack.Domain/
│  └─ YumeTrack.Infrastructure/
└─ frontend/
```

---

## 🚀 Cómo correr el proyecto

## 1- Backend

```bash
cd backend/YumeTrack.API
dotnet restore
dotnet build
dotnet run
```

Por defecto expone API en local (según configuración del proyecto).

---

### 2- Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Configuración y variables de entorno

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5044/api
```

Ajustar según puerto real de tu API.

### Backend

`appsettings.json` no contiene secretos. En local se completan en `backend/YumeTrack.API/appsettings.Development.json` (ignorado por git) o con `dotnet user-secrets`. En producción se usan variables de entorno:

| Variable | Descripción |
|---|---|
| `ConnectionStrings__DefaultConnection` | Connection string de Npgsql **o** URL `postgres://user:pass@host/db` (Neon, Supabase, Render) |
| `JwtSettings__Key` | Clave secreta del JWT, mínimo 32 caracteres |
| `DeepL__ApiKey` | Opcional. Sin ella las sinopsis se muestran en su idioma original |
| `Cors__AllowedOrigins__0` | URL del frontend desplegado (`Cors__AllowedOrigins__1`, ... para más) |
| `PORT` | Puerto de escucha (lo define el hosting) |

Las migraciones se aplican solas al iniciar la API y `GET /health` sirve para el health check del hosting.

### Deploy

- **Backend:** `backend/Dockerfile` (contexto `backend/`).
- **Frontend:** `npm run build` genera `dist/`; `vercel.json` y `public/_redirects` resuelven el fallback de SPA en Vercel, Netlify y Cloudflare Pages.

---

## 🧪 Tests

```bash
cd backend
dotnet test
```

---

## 🗃️ Entity Framework / migraciones

Cuando se modifican entidades, `AppDbContext` o relaciones:

```bash
cd backend/YumeTrack.API
dotnet ef migrations add NombreMigracion --project ../YumeTrack.Infrastructure --startup-project .
dotnet ef database update --project ../YumeTrack.Infrastructure --startup-project .
dotnet build
```

---

## ✨ Funcionalidades destacadas

- Feed social basado en reseñas reales (`UserTitles`), sin “posts” separados.
- Notificaciones conectadas al flujo social (follow/comentarios).
- Timestamps relativos para mejor lectura de actividad social.
- Diseño oscuro consistente y componentes orientados a UX de producto real.

---

## 📌 Objetivo del proyecto

Construir un MVP sólido y presentable para portfolio, priorizando:

- valor de producto,
- consistencia UX,
- arquitectura mantenible,
- alcance realista (sin sobrearquitectura).

---

## 👨‍💻 Autor

## **Danilo Mercado**

## 📄 Licencia

MIT
