# Requisitos funcionales — SHOPPY T&M

Roles: ver [roles y permisos](roles-y-permisos.md).

## 1. Autenticación y cuenta

| ID | Requisito | Rol |
|---|---|---|
| RF-01 | El sistema debe permitir registrarse con nombre, correo electrónico, contraseña y confirmación de contraseña. | Visitante |
| RF-02 | El sistema debe validar que el correo tenga formato válido y no esté registrado, que las contraseñas coincidan y tengan mínimo 8 caracteres. | Visitante |
| RF-03 | El sistema debe permitir iniciar sesión con correo y contraseña. | Visitante |
| RF-04 | El sistema debe permitir cerrar sesión. | Todos los autenticados |
| RF-05 | Si un visitante abre el enlace de una publicación, el sistema debe pedirle iniciar sesión y luego llevarlo a esa publicación. | Visitante |
| RF-06 | El sistema debe asignar el rol `usuario` a toda cuenta nueva. | Sistema |

## 2. Catálogo y búsqueda

| ID | Requisito | Rol |
|---|---|---|
| RF-07 | El sistema debe mostrar en el inicio las categorías y las publicaciones activas más recientes. | Comprador |
| RF-08 | El sistema debe permitir buscar por texto (título, descripción, categoría o ubicación). | Comprador |
| RF-09 | El sistema debe permitir filtrar por categoría, condición, rango de precio y ubicación. | Comprador |
| RF-10 | El sistema debe permitir ordenar por más recientes, precio menor, precio mayor y nombre. | Comprador |
| RF-11 | El sistema debe mostrar estadísticas de publicaciones activas y número de categorías. | Comprador |
| RF-12 | El sistema debe mostrar el detalle de una publicación: galería de fotos, precio, descripción, condición, ubicación, vendedor y fecha. | Comprador |
| RF-13 | El sistema debe mostrar hasta 6 productos relacionados de la misma categoría. | Comprador |

## 3. Publicaciones

| ID | Requisito | Rol |
|---|---|---|
| RF-14 | El sistema debe permitir crear una publicación con título, categoría, precio, condición, ubicación, descripción y hasta 10 fotos (JPG, PNG o WEBP). | Vendedor |
| RF-15 | El sistema debe permitir listar las publicaciones propias con su estado (activo/vendido). | Vendedor |
| RF-16 | El sistema debe permitir editar una publicación propia y agregar nuevas fotos. | Vendedor |
| RF-17 | El sistema debe permitir eliminar una foto individual de una publicación propia, excepto la última. | Vendedor |
| RF-18 | El sistema debe permitir marcar una publicación propia como vendida; las vendidas no aparecen en el catálogo. | Vendedor |
| RF-19 | El sistema debe permitir eliminar una publicación propia junto con sus fotos, favoritos y mensajes asociados. | Vendedor |
| RF-20 | El sistema debe impedir (en el backend) que un usuario edite, elimine, marque como vendida o elimine fotos de publicaciones ajenas, respondiendo con error 403/404. | Sistema |
| RF-21 | El sistema debe comprimir las fotos en el navegador antes de enviarlas y almacenarlas de forma persistente y pública. | Sistema |

## 4. Favoritos, mensajería y compartir

| ID | Requisito | Rol |
|---|---|---|
| RF-22 | El sistema debe permitir agregar o quitar una publicación de favoritos. | Comprador |
| RF-23 | El sistema debe listar los favoritos del usuario que sigan activos. | Comprador |
| RF-24 | El sistema debe permitir enviar mensajes al vendedor de una publicación. | Comprador |
| RF-25 | El sistema debe permitir al vendedor responder los mensajes recibidos sobre sus publicaciones. | Vendedor |
| RF-26 | El sistema debe agrupar los mensajes en conversaciones por publicación y por usuario, y marcar como leídos los mensajes al abrir la conversación. | Comprador / Vendedor |
| RF-27 | El sistema debe mostrar el número de mensajes nuevos (no leídos). | Comprador / Vendedor |
| RF-28 | El sistema debe permitir compartir una publicación: copiar enlace, compartir por WhatsApp y, si el dispositivo lo soporta, el menú nativo (Web Share API). | Comprador / Vendedor |

## 5. Perfiles

| ID | Requisito | Rol |
|---|---|---|
| RF-29 | El sistema debe mostrar el perfil propio con número de publicaciones y favoritos. | Comprador / Vendedor |
| RF-30 | El sistema debe permitir editar nombre, ubicación y foto de perfil (el correo y el rol no son editables). | Comprador / Vendedor |
| RF-31 | El sistema debe mostrar el perfil público de un vendedor con sus publicaciones activas. | Comprador |

## 6. Administración

| ID | Requisito | Rol |
|---|---|---|
| RF-32 | El sistema debe ofrecer un panel de administración con todas las publicaciones (activas y vendidas), con búsqueda por título, vendedor o correo y filtro por estado. | Administrador |
| RF-33 | El sistema debe permitir al administrador eliminar cualquier publicación que incumpla las reglas. | Administrador |
| RF-34 | El sistema debe permitir al administrador editar cualquier publicación y eliminar sus fotos. | Administrador |
| RF-35 | El sistema debe mostrar una indicación visual clara y pedir confirmación cuando el administrador realiza una acción sobre contenido ajeno. | Administrador |
| RF-36 | El sistema debe registrar en los logs del servidor cada acción administrativa sobre contenido ajeno. | Sistema |
| RF-37 | El sistema debe mostrar las opciones administrativas solo a usuarios con rol `admin`, y validar el rol en el backend en cada operación. | Sistema |
