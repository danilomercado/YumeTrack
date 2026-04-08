# 🎌 YumeTrack

YumeTrack es una plataforma web full stack para tracking de anime/manga que evoluciona hacia una red social tipo Letterboxd.

Permite a los usuarios descubrir, guardar, puntuar y reseñar títulos, además de interactuar con otros usuarios mediante follows, likes, comentarios y feed social.

---

## 🚀 Stack Tecnológico

### Frontend

- React
- Tailwind CSS
- Axios

### Backend

- ASP.NET Core Web API (C#)
- Clean Architecture

### Base de Datos

- PostgreSQL
- Entity Framework Core

### APIs Externas

- Kitsu (anime/manga)
- API de traducción (para traducir sinopsis automáticamente a español)

---

## ✨ Funcionalidades

### 🔐 Autenticación

- Registro y login con JWT
- Persistencia de sesión
- Rutas protegidas

### 👤 Usuarios

- Perfil público y privado
- Bio editable
- Sistema de seguidores (follow/unfollow)

### 📺 Títulos

- Búsqueda de anime/manga desde API externa (Kitsu)
- Obtención de datos en tiempo real
- Traducción automática de sinopsis al español mediante API externa

### 📚 Lista personal

- Estado (viendo, completado, etc.)
- Progreso
- Puntaje (0–10)
- Favoritos
- Reseñas (reviews)

### 🌐 Social

- Feed global
- Feed de seguidos
- Likes en reviews
- Comentarios en reviews
- Notificaciones (follow + comentarios)

### 🔔 Notificaciones

- Sistema de notificaciones con badge
- Redirección a perfiles o reviews

---

## 🛠️ Instalación y ejecución

### 📌 Clonar repositorio

git clone https://github.com/danilomercado/YumeTrack.git
cd YumeTrack

---

### ⚙️ Backend

cd YumeTrack.API
dotnet restore
dotnet build
dotnet run

---

### 🧠 Base de datos (EF Core)

dotnet ef migrations add InitialCreate --project YumeTrack.Infrastructure --startup-project YumeTrack.API
dotnet ef database update --project YumeTrack.Infrastructure --startup-project YumeTrack.API

⚠️ IMPORTANTE:
Cada vez que modifiques entidades o relaciones:
dotnet ef migrations add NombreMigracion
dotnet ef database update
dotnet build

---

### 🎨 Frontend

cd yumetrack-frontend
npm install
npm run dev

---

## 🔐 Variables de entorno

### Frontend (.env)

VITE_API_URL=http://localhost:5000/api

---

## 🧱 Arquitectura

Backend organizado en Clean Architecture:

- Domain
- Application
- Infrastructure
- API

---

## 📌 Estado del proyecto

✔ Auth completo
✔ CRUD de listas
✔ Feed social
✔ Likes y comentarios
✔ Notificaciones
✔ Perfil público

🟡 En progreso:

- Mejoras UX
- Paginación en feed
- Sección de reviews en perfil

🔜 Futuro:

- Avatares
- Feed más avanzado
- Sistema tipo Letterboxd completo

---

## 🧠 Decisiones clave

- No se usa tabla "Posts", todo se basa en reviews
- Feed basado en UserTitles
- Sin actividad irrelevante (ej: follows en feed)
- Enfoque en UX simple y social

---

## 👨‍💻 Autor

Danilo Mercado
Rosario, Argentina

---

## 📄 Licencia

MIT

---
