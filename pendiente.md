# Pendiente

Estado al 2026-11-11. El sitio ya está publicado y funcionando:
- Frontend en Vercel: `https://yume-track.vercel.app`
- Backend en Render: `https://yumetrack-hue2.onrender.com` (ya con el chat desplegado: `/api/chat/*` y `/hubs/chat` piden sesión).
- Base de datos en Neon (São Paulo).

Todo lo hecho hasta ahora está commiteado y subido (último commit `166ebc9`). Lo último que se hizo:
- Scroll arriba al navegar y al tocar cualquier botón del header; caja de respuesta debajo del comentario; flechas y sinopsis en español en los destacados.
- **Chat 1 a 1** en tiempo real (SignalR) con botón flotante abajo a la derecha, buscador de personas ("+ Nuevo"; si no seguís a alguien pregunta si querés seguirlo), no leídos y bloqueo que corta mensajes.
- Notificaciones de mensajes de chat y de likes a reseñas, y el nombre ya no sale pegado a la acción.
- El chat ahora es una **ventana emergente** desde el botón flotante (abajo a la derecha en la compu, pantalla completa en el celular), no una página. Las notificaciones de mensajes y el botón "Mensaje" del perfil la abren directo en esa conversación. Se vio en capturas con un navegador a 390×844 y a 1280×800.

**Nada de lo anterior se vio todavía en pantalla ni en el celular**: ver la sección 3.

## 1. Antes de abrirlo a usuarios reales

- [ ] **Rotar secretos expuestos**
  - [x] Contraseña de la base de datos (nueva, ya en Neon).
  - [x] Clave JWT de producción nueva, cargada en Render. La de desarrollo y la de producción se pegaron en un chat: si hace falta, generar otras.
  - [ ] Crear una clave de aplicación propia de Gmail para YumeTrack. La actual (`Email__User`, `Email__Password`, `Email__From`) es de otro proyecto y se pegó en un chat; revocarla. Mientras tanto el correo de recuperación no funciona en producción.
  - [ ] Rotar la contraseña de Neon y la `DeepL__ApiKey`, que también quedaron en el chat.
- [x] Hosting elegido y desplegado (Vercel + Render + Neon).
- [ ] **Variables que faltan o hay que revisar en Render**
  - `DeepL__ApiKey`: **hace falta** para que se traduzcan las sinopsis (destacados y fichas). Sin ella salen en inglés.
  - `Admin__Emails` = tu correo, para entrar a `/admin/reports`.
  - `PORT=8080`, `Cors__AllowedOrigins__0` y `App__FrontendUrl` (sin barra final): ya cargadas, verificar que sigan bien.
  - Front: `VITE_API_URL=https://yumetrack-hue2.onrender.com/api` (queda como Secret en Vercel; funciona, pero no se puede leer).
- [ ] **Correo real**: pasar de Gmail a Brevo (300 por día gratis) y verificar el dominio remitente.
- [ ] **Dominio propio con HTTPS**, y actualizar CORS y `App__FrontendUrl`.
- [ ] **Textos legales**: política de privacidad y términos de uso, con enlaces en el footer.

## 2. Importante (no bloquea, pero conviene antes de tener usuarios reales)

- [ ] Pasar el token de sesión de `localStorage` a cookie httpOnly (hoy un XSS podría robarlo).
- [ ] Política de contenido (CSP) en el front y autoalojar las fuentes (hoy vienen de Google).
- [ ] CI del backend: workflow que corra `dotnet test` (solo existe `.github/workflows/frontend.yml`).
- [ ] Dockerfile: correr como usuario sin privilegios y declarar chequeo de salud en `/health`.
- [ ] Backups periódicos de la base (los planes gratis casi nunca los incluyen).
- [ ] Monitoreo: aviso si el sitio se cae (UptimeRobot) y logs del backend.
- [ ] Verificar el correo al registrarse.
- [ ] Tokens: un token robado vale hasta 60 minutos. Evaluar renovación y revocación.
- [ ] Arranque en frío del backend en Render gratis (~30 s): ya hay aviso en el front. UptimeRobot pegándole a `/health` lo mantiene despierto.
- [ ] Traducir también las sinopsis de manga y de los demás carruseles (hoy solo los 6 primeros anime del destacado y las fichas).

## 3. Antes de mostrar el sitio

- [ ] **Probar el chat con dos cuentas** (dos navegadores, uno en el celular real; el teclado del teléfono puede tapar el campo de escribir): mensajes en vivo, no leídos, botón flotante, "+ Nuevo" con buscador, aviso de "seguir y escribir", bloqueo, notificaciones en la campana (mensaje y like) y cómo se ve en el celular. Con el backend dormido (~30 s) la conexión en vivo tarda en volver.
- [ ] Recorrer con una cuenta real todo lo que requiere sesión (no se probó en pantalla):
  - Comentar, responder y reaccionar (la respuesta ahora abre la caja debajo del comentario).
  - Crear una lista, agregar títulos y abrir su enlace público (`/l/...`).
  - Comentar por episodio desde la ficha de un título.
  - Denunciar y bloquear; revisar `/admin/reports` con un correo en `Admin__Emails`.
  - Feed: pestañas Siguiendo y Actividad; sugerencias de a quién seguir.
  - Verificación en dos pasos (activar, entrar con código, códigos de recuperación, desactivar). Con la clave JWT nueva hay que reconfigurarla.
  - Recuperar contraseña por correo.
- [ ] Revisar el diseño de las pantallas con sesión (Mi lista, Perfil, Reseña): solo se verificaron las públicas.
- [x] Notificaciones: el nombre salía pegado a la acción ("betote siguió"). Corregido con un espacio; además ahora avisan de mensajes de chat y de likes a reseñas. Falta verlo en pantalla.
- [ ] El contador de la campana se actualiza cada 60 s (el del chat sí es instantáneo). Evaluar empujarlo también por SignalR.
- [ ] Revisar `kanji` chicos del menú (声, 図 a 15 px se leen justos).
- [ ] "Que se note dónde estás parado": el menú ya marca la página activa y ahora también el botón de usuario. Falta marcar algo en páginas que no están en el menú (`/reviews/:id`, perfiles ajenos).

## 4. Próximas funciones (pedidas)

### Perfil personalizable
- [ ] **Foto de perfil**: subir imagen (recorte, límite de tamaño, almacenamiento: Cloudinary, R2 o similar; el disco de Render gratis no persiste).
- [ ] **Banner** del perfil.
- [ ] **Cosméticos**: marcos de avatar, insignias, colores o fondos del perfil, títulos. Definir de dónde salen (logros, quizzes, nivel, tienda sin dinero real).
- [ ] Mostrar todo esto en el perfil propio y en el público, y en comentarios/feed (avatar).

### Quizzes y tests de personalidad anime
- [ ] **Quiz de "qué tipo de poder tenés"**, con los sistemas más conocidos y sus características:
  - Nen (Hunter x Hunter): reforzador, emisor, transformador, manipulador, materializador, especialista.
  - Chakra y naturalezas (Naruto): fuego, viento, rayo, tierra, agua.
  - Ki (Dragon Ball).
  - A sumar: Haki (One Piece), Maldición/Técnica (Jujutsu Kaisen), Alquimia (Fullmetal Alchemist), Quirk (My Hero Academia), Respiración (Demon Slayer), Stands (JoJo), etc.
- [ ] Cada quiz con preguntas, resultado con descripción y características (fortalezas, debilidades, personajes parecidos).
- [ ] **El resultado se guarda y aparece en el perfil** (insignia o tarjeta). Se puede repetir; mostrar el último o permitir elegir cuál exhibir.
- [ ] Comparar resultados con amigos y ver cuántos tienen el mismo tipo.
- [ ] Más adelante: puzles o minijuegos (adivinar el anime, trivia) que den cosméticos o insignias. Esto conecta con los cosméticos de arriba.
- [ ] Pensar el modelo: tabla de quizzes, preguntas, resultados por usuario (`UserQuizResult`), y contenido editable sin redeploy.

## 5. Ideas a futuro

- [x] **Chat 1 a 1** hecho (ver arriba). Pendiente del chat:
  - [ ] **Grupos**: el modelo ya los admite (`Conversation` + `ConversationParticipant`, `DirectKey` nulo); falta nombre del grupo, alta/baja de integrantes, y adaptar `ChatController` (hoy asume un solo "otro").
  - [ ] Iniciar chat desde más lugares (lista de seguidores, resultados de búsqueda). Hoy se puede desde el perfil ("Mensaje") y desde "+ Nuevo".
  - [ ] Decidir si cualquiera puede escribirle a cualquiera (hoy sí, salvo bloqueo) o solo a quien te sigue/aceptó. Es lo más abierto al spam.
  - [ ] Denunciar un mensaje o conversación (hoy solo se puede denunciar al usuario desde su perfil).
  - [ ] Indicador "escribiendo...", estado en línea, borrar mensajes.
  - [ ] Si el backend pasa a más de una instancia, SignalR necesita un backplane (Redis); con una sola instancia en Render no hace falta.
- [ ] Mostrar las listas públicas en el perfil de cada usuario.
- [ ] Reordenar títulos dentro de una lista.
- [ ] Volver a la página de origen después de iniciar sesión (hoy va a `/`).
- [ ] Paginación del feed y TanStack Query.
- [ ] Toasts y focus trap completo en los modales.
- [ ] Animar la salida de ventanas y menús (hoy desaparecen de golpe).

## Cómo correr todo en local

- Backend: `cd backend/YumeTrack.API` y `ASPNETCORE_ENVIRONMENT=Development dotnet run --no-launch-profile --urls http://localhost:5044`. Lee `backend/YumeTrack.API/.env` solo en desarrollo; al arrancar aplica las migraciones.
- Frontend: `cd frontend` y `npm run dev -- --host localhost --port 5173`.
- Tests: `cd backend && dotnet test YumeTrack.Tests` (67) y `cd frontend && npm test` (13). Con el backend corriendo, `dotnet test` falla porque la DLL queda bloqueada; hay que frenarlo antes.
- Copia de plantilla de configuración: `backend/YumeTrack.API/.env.example`.
