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

## 🔐 Variables de entorno

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

Ajustar según puerto real de tu API.

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
