# Despliegue SHOPPY T&M en Vercel

## Qué se despliega

- Frontend React (Vite) → estático en Vercel
- Backend Express → función serverless en `/api`
- Base de datos → Clever Cloud MySQL (ya configurada)

## Pasos

1. Sube el repo a GitHub (sin `backend/.env`; usa variables en Vercel).

2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.

3. Configura **Root Directory** = raíz del monorepo (donde está `vercel.json`).

4. En **Settings → Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `DB_HOST` | `bemyxi5fpumrboeuw8xo-mysql.services.clever-cloud.com` |
| `DB_PORT` | `3306` |
| `DB_USER` | (tu usuario Clever) |
| `DB_PASSWORD` | (tu password Clever) |
| `DB_NAME` | `bemyxi5fpumrboeuw8xo` |
| `SESSION_SECRET` | un texto largo aleatorio |
| `FRONTEND_ORIGIN` | `https://TU-PROYECTO.vercel.app` (ajústalo tras el primer deploy) |

5. Deploy. La URL será tipo `https://shoppy-tm.vercel.app`.

6. Vuelve a poner `FRONTEND_ORIGIN` con esa URL exacta y redespliega.

## Local

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:4000  

## Notas

- El pool MySQL usa máx. **3 conexiones** (límite Clever ~5).
- En Vercel las fotos se guardan en `/tmp` (efímeras). Para producción real conviene Cloudinary/S3.
- Las sesiones van en cookie firmada (`cookie-session`), compatibles con serverless.
