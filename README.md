# 🌙 YumeTrack

Aplicación full stack para trackear anime y manga.
Permite a los usuarios buscar títulos, guardarlos y gestionar su progreso, puntuación y favoritos.

---

## 🚀 Stack Tecnológico

### Frontend

- React (Vite)
- TailwindCSS

### Backend

- ASP.NET Core Web API (.NET)
- Clean Architecture

### Base de Datos

- SQL Server
- Entity Framework Core

### API Externa

- Kitsu API

---

## ✨ Features

- 🔐 Autenticación con JWT
- 🔎 Búsqueda de anime/manga
- 📚 Lista personal (watchlist / reading list)
- 📊 Seguimiento de progreso
- ⭐ Sistema de puntuación
- ❤️ Favoritos
- 🌐 Preparado para deploy en la nube

---

## 📁 Estructura del Proyecto

```
/backend
  /src
    /Domain
    /Application
    /Infrastructure
    /API

/frontend
```

---

## ⚙️ Configuración

## 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/yumetrack.git
cd yumetrack
```

---

## 🔧 Backend (.NET)

### 2. Ir al backend

```bash
cd backend
```

### 3. Abrir la solución

```bash
start YumeTrack.sln
```

---

### 4. Configurar variables (user-secrets)

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "TU_CONNECTION_STRING"
dotnet user-secrets set "Jwt:Key" "TU_SECRET_KEY"
```

---

### 5. Aplicar migraciones

```bash
dotnet ef database update
```

---

### 6. Ejecutar API

```bash
dotnet run --project src/API
```

👉 API disponible en:
https://localhost:5001

---

## 🎨 Frontend (React)

### 7. Ir al frontend

```bash
cd ../frontend
```

### 8. Instalar dependencias

```bash
npm install
```

---

### 9. Crear archivo .env

```bash
touch .env
```

Contenido:

```env
VITE_API_URL=https://localhost:5001
```

---

### 10. Ejecutar frontend

```bash
npm run dev
```

👉 App disponible en:
http://localhost:5173

---

## 🔐 Variables de Entorno

### Backend (User Secrets / Producción)

- ConnectionStrings
- Jwt

### Frontend (.env)

- VITE_API_URL

---

## ☁️ Deploy (visión general)

- Backend → Azure App Service / AWS
- DB → Azure SQL / AWS RDS
- Frontend → Vercel / Netlify

---

## 🧠 Buenas prácticas aplicadas

- Clean Architecture
- Separación por capas
- Configuración por entorno
- Manejo de errores global
- Código desacoplado
- Uso de DTOs

---

## 📌 Roadmap

- [ ] Sistema de reviews
- [ ] Recomendaciones con IA
- [ ] Calendario de emisiones
- [ ] Noticias de anime
- [ ] Social (seguir usuarios)

---

## 👨‍💻 Autor

Danilo Mercado
