# Informe de mantenimiento mensual — SHOPPY T&M

| Campo | Registro |
|---|---|
| Aplicación | SHOPPY T&M (marketplace PWA de segunda mano) |
| URL de producción | https://shoppy-tm-1qwb.vercel.app (frontend) · https://shoppy-tm-snowy.vercel.app (API) |
| Período | Octubre 2026 |
| Fecha de ejecución | 13 de octubre de 2026 |
| Responsable | Equipo SHOPPY T&M (Luisa, Mateo, Juan David, Camilo) |
| Guía aplicada | *Guía práctica de mantenimiento mensual web* |
| Versión final desplegada | rama `main` en GitHub, desplegada en Vercel (ambos proyectos en estado *success*) |

## 1. Objetivo

Mantener la aplicación disponible, segura y funcional mediante revisiones preventivas, respaldo de la base de datos, pruebas funcionales y documentación de las actividades realizadas.

## 2. Actividades preventivas realizadas

### 2.1 Seguridad

| Revisión | Resultado |
|---|---|
| HTTPS y certificado | HTTPS activo en frontend y API. Certificado de Google Trust Services (WR1) vigente hasta el **27/11/2026**; Vercel lo renueva automáticamente. HTTP redirige a HTTPS (308). |
| Cuentas administrativas y roles | La columna `usuarios.rol` **no existía** en producción, por lo que ningún usuario era administrador. Se ejecutó la migración `npm run rol:admin` (con respaldo previo). Estado final: 1 administrador, 6 usuarios. |
| Dependencias (`npm audit`) | Backend: 0 vulnerabilidades. Frontend: 2 vulnerabilidades (1 alta en `source-map-js`, 1 baja en `serialize-javascript`); corregidas con `npm audit fix`, sin cambios mayores. Resultado final: 0 vulnerabilidades. |
| Credenciales expuestas | `.env` no está en el repositorio ni en su historial. Los volcados SQL del repositorio no contienen contraseñas ni correos. `backend/.env.example` mostraba el host y el usuario reales de la base de datos: se reemplazaron por valores de ejemplo. La configuración del equipo ahora identifica a cada integrante por `usuario_id` y no por correo, porque el repositorio es **público**. |
| Sesiones | Se comprobó que producción rechaza una cookie firmada con el secreto por defecto del código (`SESSION_SECRET` está configurado en Vercel). |
| Registros de acceso | No se revisaron: requieren acceso al panel de Vercel (ver pendientes). |

### 2.2 Base de datos e información

| Revisión | Resultado |
|---|---|
| Conexión | OK (MySQL 8 en Clever Cloud, ~170 ms de latencia). |
| Tamaño | ~256 KB en 6 tablas; muy por debajo del límite del plan. |
| Integridad | 0 publicaciones sin usuario, 0 sin categoría, 0 fotos huérfanas. |
| Respaldo | Script nuevo `npm run db:respaldo` → `backend/backups/` (carpeta excluida de Git por contener datos personales). |
| Restauración | Probada en una instancia MariaDB local temporal y aislada: las 6 tablas se restauraron con los mismos conteos que producción (usuarios 7, publicaciones 11, fotos 10, mensajes 7, favoritos 1, categorías 8) y codificación UTF-8 correcta. Luego se eliminó la instancia. |

### 2.3 Rendimiento y disponibilidad

| Revisión | Resultado |
|---|---|
| Disponibilidad | Frontend, API, manifiesto PWA y service worker responden 200. |
| Tiempos de respuesta | `/api/health` ~0,5 s; login ~0,4 s; catálogo ~0,6 s. |
| Carga concurrente | **Falla encontrada:** con 10 peticiones simultáneas, 6 respondían 500 (ver incidencia 1). Tras la corrección: 30/30 peticiones OK en 3 rondas. |
| Imágenes | Imágenes de productos de 200–360 KB (aceptable). Las fotos nuevas que suben los usuarios se comprimen en el navegador (`comprimirImagen.js`). |

### 2.4 Funcionalidades

Se creó el script `npm run pruebas:humo`, reutilizable cada mes. Crea, edita y elimina una publicación de prueba sin dejar datos. Resultado final contra producción: **20/21 pruebas OK**.

| Prueba | Resultado |
|---|---|
| API disponible, catálogo exige sesión | OK |
| Rechazo de cookie falsificada | OK |
| Login incorrecto / correcto, sesión activa, cierre de sesión | OK |
| Catálogo, búsqueda por texto, filtro por categoría y orden | OK |
| Detalle de producto, página de equipo | OK |
| Todas las publicaciones tienen foto y la foto es una imagen accesible | OK (11/11) |
| Favoritos agregar / quitar | OK |
| Crear, editar y eliminar publicación con foto | OK |
| Panel de administración bloqueado para usuarios normales (403) | OK |
| Foto subida guardada de forma persistente (Vercel Blob) | **FALLA** (ver incidencia 2) |
| Vista móvil (390 px): sin desbordamiento horizontal ni imágenes rotas | OK (revisión manual en navegador) |
| Recuperación de contraseña | No aplica: la aplicación no tiene esta función. |

## 3. Incidencias encontradas y acciones correctivas

### Incidencia 1 — Errores 500 por límite de conexiones a MySQL

| Campo | Registro |
|---|---|
| Fecha y hora | 13/10/2026, 17:55 |
| Módulo afectado | Backend / base de datos (todas las rutas) |
| Descripción e impacto | El plan de Clever Cloud permite **5 conexiones simultáneas**. Cada instancia de Vercel abría hasta 3 conexiones y las dejaba abiertas al congelarse, y MySQL no las cerraba hasta 8 horas después. Con varios usuarios a la vez, las peticiones fallaban con `ER_USER_LIMIT_REACHED` (500). |
| Acción realizada | `backend/src/db.js`: 1 conexión por instancia en Vercel; `wait_timeout` de sesión a 60 s; reintento con espera ante límite de conexiones o conexión perdida; liberación de conexiones al terminar cada respuesta. El endpoint de equipo pasó de 8 consultas en paralelo a 2 consultas. |
| Resultado / estado | **Solucionado.** Prueba concurrente: 30/30 OK. |

### Incidencia 2 — Fotos subidas por usuarios no son persistentes

| Campo | Registro |
|---|---|
| Fecha y hora | 13/10/2026, 17:52 |
| Módulo afectado | Publicar / editar producto y foto de perfil |
| Descripción e impacto | En Vercel no está configurada la variable `BLOB_READ_WRITE_TOKEN`, así que las fotos se guardan en `/tmp`, que se borra al reiniciar la instancia. 6 publicaciones tenían la foto rota (404). |
| Acción realizada | Se restauraron las 7 publicaciones afectadas (6 rotas y 1 sin foto) con imágenes guardadas en `frontend/public/assets/productos/`, que forman parte del despliegue. |
| Resultado / estado | **Pendiente (escalado).** Las fotos actuales quedaron bien, pero las fotos que se suban de ahora en adelante se seguirán perdiendo hasta configurar Vercel Blob (ver recomendaciones). |

### Incidencia 3 — Rol de administrador no existía en producción

| Campo | Registro |
|---|---|
| Fecha y hora | 13/10/2026, 17:48 |
| Módulo afectado | Administración |
| Descripción e impacto | Faltaba la columna `usuarios.rol` porque la migración nunca se ejecutó en producción. El login funcionaba gracias a un respaldo en el código, pero nadie podía moderar publicaciones. |
| Acción realizada | Respaldo verificado y luego `npm run rol:admin`. |
| Resultado / estado | **Solucionado.** |

### Incidencia 4 — Cuenta duplicada de un integrante

| Campo | Registro |
|---|---|
| Fecha y hora | 13/10/2026, 17:53 |
| Módulo afectado | Usuarios / página de equipo |
| Descripción e impacto | Al publicar los productos del equipo se creó una cuenta nueva para Juan David, que ya tenía cuenta. |
| Acción realizada | Su producto se movió a su cuenta original y se eliminó la cuenta nueva, que no tenía mensajes ni favoritos (en una transacción). |
| Resultado / estado | **Solucionado.** Queda una segunda cuenta antigua con el mismo nombre que se usó para pruebas de mensajería; se recomienda revisarla. |

## 4. Lista de chequeo mensual

| Área | Actividad | Estado |
|---|---|---|
| Seguridad | HTTPS y certificado SSL/TLS verificados | ✅ |
| Seguridad | Permisos y cuentas administrativas revisados | ✅ |
| Seguridad | Dependencias y vulnerabilidades evaluadas | ✅ |
| Información | Copia de seguridad realizada | ✅ |
| Información | Integridad de los datos verificada | ✅ |
| Información | Restauración de respaldo comprobada en entorno seguro | ✅ |
| Funcionamiento | Inicio de sesión y registro probados | ✅ Login y cierre de sesión. El registro se probó solo en su validación, para no crear cuentas de prueba. |
| Funcionamiento | Formularios, búsquedas y operaciones principales probados | ✅ |
| Funcionamiento | Imágenes y archivos verificados | ⚠️ Las existentes OK; subida no persistente (incidencia 2) |
| Funcionamiento | Vista móvil y PWA revisadas | ✅ |
| Infraestructura | Registros de errores revisados | ⚠️ Solo los locales y las respuestas de la API; los registros de Vercel requieren acceso al panel |
| Infraestructura | Almacenamiento y recursos comprobados | ✅ Base de datos y límite de conexiones |
| Infraestructura | Despliegue y variables de entorno verificados | ⚠️ Despliegues OK; falta `BLOB_READ_WRITE_TOKEN` |
| Documentación | Incidencias y correcciones registradas | ✅ |
| Documentación | Informe mensual elaborado | ✅ |

## 5. Estado final de la aplicación

**Operativa.** Producción está disponible con HTTPS, sin vulnerabilidades conocidas en las dependencias y con la base de datos íntegra y respaldada. Las funciones principales están probadas y la app soporta peticiones concurrentes. Las 11 publicaciones activas muestran su foto. Queda una tarea pendiente que depende de acceso a Vercel (incidencia 2).

## 6. Evidencias

- Página de equipo en producción (escritorio): [evidencias/equipo-escritorio.png](evidencias/equipo-escritorio.png)
- Inicio en vista móvil (390 px): [evidencias/inicio-movil.png](evidencias/inicio-movil.png)
- Pruebas reproducibles: `cd backend && PRUEBA_EMAIL=... PRUEBA_PASSWORD=... npm run pruebas:humo`

## 7. Recomendaciones y actividades pendientes

1. **(Alta) Activar Vercel Blob.** En Vercel, abrir el proyecto del backend y entrar a *Storage*, crear un *Blob Store* y conectarlo al proyecto (esto crea `BLOB_READ_WRITE_TOKEN`). Luego hacer *Redeploy* y ejecutar `npm run pruebas:humo`: la prueba "Foto subida es persistente" debe pasar.
2. **(Media) Revisar los registros de Vercel** (*Logs*) en busca de errores 500 o accesos sospechosos.
3. **(Media) Contraseñas de las cuentas creadas para el equipo:** los integrantes deben cambiarlas al entrar. La app no tiene opción de cambio de contraseña, así que se recomienda agregarla.
4. **(Baja) Cuenta antigua duplicada de Juan David:** decidir si se conserva, porque tiene mensajes de prueba.
5. **(Baja) Restaurar el MySQL de XAMPP local:** no arranca porque le falta el archivo `aria_log.00000002`. No afecta a producción.
6. Cada mes: ejecutar `npm run db:respaldo`, `npm audit` (en backend y frontend) y `npm run pruebas:humo`, y actualizar este informe.

## 8. Conclusión

Se aplicó la guía de mantenimiento mensual completa. Se corrigieron 3 incidencias, entre ellas una de disponibilidad que provocaba errores 500 con varios usuarios a la vez. Queda 1 pendiente que requiere acceso al panel de Vercel. La aplicación quedó en estado operativo y con herramientas de respaldo y prueba para los próximos mantenimientos.
