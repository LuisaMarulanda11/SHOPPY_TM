# Requisitos no funcionales — SHOPPY T&M

## 1. Seguridad

| ID | Requisito |
|---|---|
| RNF-01 | Las contraseñas deben almacenarse con hash **bcrypt** (nunca en texto plano). |
| RNF-02 | La sesión debe manejarse con una cookie firmada, `httpOnly`, `secure` en producción y `sameSite=lax`. |
| RNF-03 | Toda autorización (propietario y rol) debe validarse en el **backend**; ocultar botones en el frontend no es suficiente. |
| RNF-04 | El rol del usuario debe leerse de la base de datos en cada operación protegida, nunca de datos enviados por el cliente. |
| RNF-05 | Ningún usuario debe poder cambiar su propio rol desde la aplicación. |
| RNF-06 | Las credenciales (base de datos, secretos, tokens) deben estar en variables de entorno y no versionarse (`.env` en `.gitignore`). |
| RNF-07 | Las consultas SQL deben usar parámetros (`?`) para prevenir inyección SQL. |
| RNF-08 | Solo se deben aceptar imágenes JPG, PNG o WEBP de máximo 8 MB. |

## 2. Rendimiento y capacidad

| ID | Requisito |
|---|---|
| RNF-09 | El backend debe usar como máximo 3 conexiones simultáneas a MySQL (límite de 5 del proveedor). |
| RNF-10 | Las fotos deben reducirse a máximo 1600 px y ~400 KB antes de subirse, y cada envío no debe superar 4.5 MB. |
| RNF-11 | El catálogo y el detalle de producto deben cargar en menos de 3 segundos en una conexión móvil 4G. |
| RNF-12 | Las imágenes del catálogo deben cargarse de forma diferida (`lazy loading`). |

## 3. Disponibilidad y persistencia

| ID | Requisito |
|---|---|
| RNF-13 | La aplicación debe estar desplegada en Vercel y disponible 24/7. |
| RNF-14 | Las fotos deben almacenarse en un servicio persistente (Vercel Blob) accesible desde cualquier dispositivo. |
| RNF-15 | Los datos deben persistir en MySQL (Clever Cloud). |

## 4. Usabilidad y compatibilidad

| ID | Requisito |
|---|---|
| RNF-16 | La interfaz debe ser **responsive** (móvil, tableta y escritorio). |
| RNF-17 | La interfaz debe estar en español y mantener la identidad visual de SHOPPY T&M (tema oscuro, cian/violeta/rosa). |
| RNF-18 | La aplicación debe funcionar en Chrome, Edge, Firefox y Safari recientes, en Windows, macOS, Android e iOS. |
| RNF-19 | La aplicación debe poder instalarse como **PWA** y mantener en caché los recursos estáticos y las fotos visitadas. |
| RNF-20 | Los mensajes de error deben ser claros para el usuario (por ejemplo, "El correo o la contraseña son incorrectos"). |

## 5. Mantenibilidad

| ID | Requisito |
|---|---|
| RNF-21 | El proyecto debe estar separado en `frontend/` (React), `backend/` (Express) y `Docs/` (documentación). |
| RNF-22 | La API debe responder siempre con el formato `{ ok, data, error }`. |
| RNF-23 | El código debe versionarse en GitHub. |
