# YumeTrack — Frontend

SPA en React 19 + Vite + Tailwind 4 + React Router 7.

## Desarrollo

```bash
cp .env.example .env   # y ajustá VITE_API_URL
npm install
npm run dev
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Tests con Vitest + Testing Library |

## Deploy (hosting estático gratuito)

Vercel, Netlify o Cloudflare Pages:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Variable de entorno: `VITE_API_URL` (se inyecta en build time: si la cambiás, hay que volver a deployar)

El rewrite de SPA ya está en `vercel.json` y `public/_redirects`.
En el backend hay que permitir el dominio del front en CORS.

## Notas

- Si el backend está en un plan gratuito que se duerme, el front reintenta los GET
  y muestra un aviso de "Despertando el servidor…" tras 4 s sin respuesta.
- El token JWT se guarda en `localStorage`.
