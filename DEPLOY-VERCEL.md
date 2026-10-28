# Despliegue SHOPPY T&M en Vercel

## Arquitectura

- Frontend React (Vite) → proyecto Vercel con raíz en el repositorio.
- Backend Express → proyecto Vercel separado con raíz `backend`.
- MySQL → Clever Cloud. El frontend reenvía `/api` y `/uploads` al backend.

## Configuración

1. Importa el repositorio como proyecto backend en Vercel y configura **Root Directory** = `backend`. Conserva su `backend/vercel.json`.

2. En el proyecto backend, ve a **Settings → Environment Variables** y agrega:

| Variable | Valor |
|---|---|
| `DB_HOST` | Host MySQL de Clever Cloud |
| `DB_PORT` | `3306` |
| `DB_USER` | (tu usuario Clever) |
| `DB_PASSWORD` | (tu password Clever) |
| `DB_NAME` | Nombre de la base MySQL |
| `SESSION_SECRET` | un texto largo aleatorio |
| `FRONTEND_ORIGIN` | `https://shoppy-tm-1qwb.vercel.app` |
| `MAIL_HOST` | Host SMTP del proveedor de correo |
| `MAIL_PORT` | Puerto SMTP (465 para TLS o 587 para STARTTLS) |
| `MAIL_USER` | Usuario SMTP |
| `MAIL_PASSWORD` | Contraseña de aplicación de Google (si usas Gmail), no la contraseña normal |
| `MAIL_FROM` | Remitente verificado, por ejemplo `SHOPPY T&M <cuenta@tudominio.com>` |

Configura las variables que correspondan tanto en **Production** como en **Preview**. No guardes secretos en Git ni los compartas por el chat.
`FRONTEND_ORIGIN` debe ser el origen HTTPS del frontend, sin rutas ni barras adicionales.
Para Gmail, activa la verificación en dos pasos y genera una contraseña de aplicación para Vercel. Pégala en `MAIL_PASSWORD` sin espacios.

3. La primera solicitud de recuperación crea la tabla `password_reset_tokens` con `CREATE TABLE IF NOT EXISTS`. Si prefieres prepararla antes del despliegue, puedes ejecutar una sola vez la migración desde la raíz del repositorio y con las variables `DB_*` configuradas localmente:

   ```bash
   npm run migrar:password-reset --prefix backend
   ```

   Como alternativa, ejecuta `backend/sql/password_reset_tokens.sql` en Clever Cloud. La cuenta de MySQL debe permitir crear esa tabla para que funcione la recuperación automática.

4. Importa el mismo repositorio como proyecto frontend en Vercel y deja **Root Directory** en la raíz del repositorio. Sus reglas en `vercel.json` ya envían `/api` y `/uploads` a `https://shoppy-tm-snowy.vercel.app`.

5. Si cambia el dominio de cualquiera de los proyectos, actualiza el destino del proxy del frontend y `FRONTEND_ORIGIN` en el backend; luego redespliega ambos proyectos.

La opción **¿Olvidaste tu contraseña?** envía un enlace de un solo uso, válido por 30 minutos. La tabla guarda únicamente el hash del token.

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
