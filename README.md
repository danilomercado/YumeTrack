🎌 YumeTrack

Aplicación web full stack para el seguimiento y gestión de anime y manga, inspirada en plataformas como AniList y MyAnimeList.

🚀 Descripción

YumeTrack permite a los usuarios registrarse, iniciar sesión y gestionar su lista personal de anime y manga.

Incluye funcionalidades como:

estados (viendo, completado, en pausa, pendiente)

progreso (episodios/capítulos)

puntuación

favoritos

El sistema integra la API de Kitsu para obtener información actualizada y un servicio de traducción automática para adaptar sinopsis al español.

🧱 Arquitectura

El proyecto sigue Clean Architecture, separando responsabilidades en:

Domain

Application

Infrastructure

API

Esto permite un código mantenible, escalable y desacoplado.

⚙️ Tecnologías
Frontend

React

JavaScript

Tailwind CSS

Backend

ASP.NET Core

C#

Entity Framework Core

JWT Authentication

Base de datos

SQL / PostgreSQL

Integraciones

Kitsu API (anime/manga)

API de traducción (sinopsis en español)

✨ Funcionalidades

🔐 Registro e inicio de sesión con JWT

🔎 Búsqueda de anime y manga

🌐 Traducción automática de sinopsis

📄 Visualización de detalles

⭐ Gestión de lista personal

🔄 CRUD completo de títulos

🔗 Integración frontend-backend con APIs REST

🛠️ Instalación y ejecución
1. Clonar repositorio
git clone https://github.com/TU-USUARIO/YumeTrack.git
cd YumeTrack
2. Backend (.NET)
cd backend
dotnet restore
dotnet build
dotnet run

API disponible en:

https://localhost:5001
3. Frontend (React)
cd frontend
npm install
npm run dev

App disponible en:

http://localhost:5173
🔐 Autenticación

Se implementa autenticación mediante JWT:

Login / Register

Protección de endpoints

Gestión de sesión en frontend

📦 API Endpoints principales
Auth

POST /api/Auth/register

POST /api/Auth/login

Titles

GET /api/Titles/search

GET /api/Titles/anime/{id}

GET /api/Titles/manga/{id}

UserTitles

POST /api/UserTitles

GET /api/UserTitles

PUT /api/UserTitles/{id}

DELETE /api/UserTitles/{id}

📌 Estado del proyecto

🚧 En desarrollo activo

Próximas mejoras:

Perfil de usuario editable

Catálogo completo sin búsqueda

Sistema de foro/comunidad

Recomendaciones personalizadas

Mejoras de UI/UX

📷 Preview

(Agregar screenshots del proyecto acá)

👨‍💻 Autor

Danilo Mercado
Full Stack Developer Jr.

Rosario, Argentina

LinkedIn: (agregar link)

GitHub: (agregar link)

📄 Licencia

Este proyecto es de uso educativo y portfolio personal.
