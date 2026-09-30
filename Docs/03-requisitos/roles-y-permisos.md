# Roles y permisos — SHOPPY T&M

## Roles del sistema

| Rol | Cómo se identifica | Descripción |
|---|---|---|
| **Visitante** | Sin sesión activa | Persona que aún no ha iniciado sesión. |
| **Comprador** | Usuario con `rol = 'usuario'` | Explora el catálogo, guarda favoritos y contacta a los vendedores. |
| **Vendedor** | Usuario con `rol = 'usuario'` | Publica productos y administra **únicamente** sus propias publicaciones. |
| **Administrador** | Usuario con `rol = 'admin'` | Modera el contenido de toda la plataforma. |

> Comprador y Vendedor comparten la misma cuenta: todo usuario registrado puede comprar y vender. El rol se almacena en la columna `usuarios.rol` y **solo se asigna desde el servidor** (script `npm run rol:admin`), nunca desde el frontend.

## Matriz de permisos

| Acción | Visitante | Comprador / Vendedor | Administrador |
|---|:---:|:---:|:---:|
| Registrarse / iniciar sesión | ✅ | — | — |
| Ver catálogo, buscar y filtrar | ❌ (debe iniciar sesión) | ✅ | ✅ |
| Ver detalle de una publicación | ❌ (inicia sesión y vuelve al producto) | ✅ | ✅ |
| Guardar favoritos | ❌ | ✅ | ✅ |
| Contactar al vendedor (mensajes) | ❌ | ✅ | ✅ |
| Compartir una publicación | ❌ | ✅ | ✅ |
| Crear publicaciones | ❌ | ✅ | ✅ |
| Editar publicación **propia** | ❌ | ✅ | ✅ |
| Editar publicación **ajena** | ❌ | ❌ | ✅ |
| Eliminar publicación **propia** | ❌ | ✅ | ✅ |
| Eliminar publicación **ajena** | ❌ | ❌ | ✅ |
| Eliminar fotos de publicación **ajena** | ❌ | ❌ | ✅ |
| Marcar como vendida | ❌ | ✅ (solo propias) | ✅ (solo propias) |
| Panel de administración | ❌ | ❌ | ✅ |
| Cambiar el rol de un usuario | ❌ | ❌ | ❌ (solo por script en el servidor) |

## Cómo se aplica la autorización

1. **Autenticación:** la sesión es una cookie firmada; sin sesión el backend responde `401`.
2. **Rol:** en cada operación protegida el backend lee el rol desde la base de datos (nunca desde datos enviados por el navegador).
3. **Propietario:** para editar, eliminar o quitar fotos, el backend comprueba que `publicaciones.usuario_id` sea el usuario de la sesión **o** que el usuario tenga rol `admin`; si no, responde `403`.
4. **Frontend:** las opciones administrativas solo se muestran a usuarios `admin`, pero la seguridad no depende de ocultar botones.
