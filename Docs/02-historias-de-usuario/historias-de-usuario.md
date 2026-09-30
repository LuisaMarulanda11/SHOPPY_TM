# Historias de usuario — SHOPPY T&M

Formato: **Como** _[rol]_ **quiero** _[acción]_ **para** _[beneficio]_.

Prioridad: **Alta** (imprescindible), **Media** (importante), **Baja** (deseable).

Roles: **Visitante**, **Comprador**, **Vendedor**, **Administrador** (ver [roles y permisos](../03-requisitos/roles-y-permisos.md)).

Los códigos RF corresponden a los [requisitos funcionales](../03-requisitos/requisitos-funcionales.md).

## Resumen

| ID | Historia | Rol | Prioridad |
|---|---|---|---|
| HU-01 | Registrarse | Visitante | Alta |
| HU-02 | Iniciar sesión | Visitante | Alta |
| HU-03 | Abrir un enlace compartido | Visitante | Media |
| HU-04 | Explorar el catálogo | Comprador | Alta |
| HU-05 | Buscar y filtrar | Comprador | Alta |
| HU-06 | Ver el detalle de un producto | Comprador | Alta |
| HU-07 | Guardar favoritos | Comprador | Media |
| HU-08 | Contactar al vendedor | Comprador | Alta |
| HU-09 | Compartir un producto | Comprador | Media |
| HU-10 | Ver el perfil de un vendedor | Comprador | Baja |
| HU-11 | Publicar un producto | Vendedor | Alta |
| HU-12 | Administrar mis publicaciones | Vendedor | Alta |
| HU-13 | Editar mi publicación | Vendedor | Alta |
| HU-14 | Marcar como vendido | Vendedor | Media |
| HU-15 | Eliminar mi publicación | Vendedor | Alta |
| HU-16 | Responder a compradores | Vendedor | Alta |
| HU-17 | Editar mi perfil | Vendedor | Media |
| HU-18 | Ver todas las publicaciones | Administrador | Alta |
| HU-19 | Eliminar publicaciones que incumplen las reglas | Administrador | Alta |
| HU-20 | Editar contenido ajeno | Administrador | Media |

---

## Visitante

### HU-01 · Registrarse
**Como** visitante **quiero** crear una cuenta con mi nombre, correo y contraseña **para** poder comprar y vender en SHOPPY T&M.

- **Prioridad:** Alta · **Requisitos:** RF-01, RF-02, RF-06
- **Criterios de aceptación:**
  - Todos los campos son obligatorios.
  - El correo debe tener formato válido y no estar registrado.
  - La contraseña tiene mínimo 8 caracteres y coincide con la confirmación.
  - Al registrarme veo "¡Cuenta creada correctamente!" y mi cuenta queda con rol `usuario`.

### HU-02 · Iniciar sesión
**Como** visitante **quiero** iniciar sesión con mi correo y contraseña **para** acceder a mi cuenta.

- **Prioridad:** Alta · **Requisitos:** RF-03
- **Criterios de aceptación:**
  - Con datos correctos entro al inicio del marketplace.
  - Con datos incorrectos veo "El correo o la contraseña son incorrectos".

### HU-03 · Abrir un enlace compartido
**Como** visitante **quiero** que, al abrir el enlace de un producto que me compartieron, después de iniciar sesión se me muestre ese producto **para** no tener que buscarlo.

- **Prioridad:** Media · **Requisitos:** RF-05
- **Criterios de aceptación:**
  - Sin sesión, el enlace `/producto/ID` me lleva al login.
  - Tras iniciar sesión (o registrarme e iniciar sesión) llego a `/producto/ID`.

---

## Comprador

### HU-04 · Explorar el catálogo
**Como** comprador **quiero** ver las categorías y las publicaciones recientes **para** descubrir productos.

- **Prioridad:** Alta · **Requisitos:** RF-07, RF-11
- **Criterios de aceptación:**
  - Veo las categorías al principio del inicio.
  - Veo tarjetas con foto, título, precio, condición, ubicación y vendedor.
  - Solo aparecen publicaciones activas (no vendidas).

### HU-05 · Buscar y filtrar
**Como** comprador **quiero** buscar por texto y filtrar por categoría, condición, precio y ubicación **para** encontrar rápido lo que necesito.

- **Prioridad:** Alta · **Requisitos:** RF-08, RF-09, RF-10
- **Criterios de aceptación:**
  - Puedo combinar varios filtros a la vez.
  - Puedo ordenar por recientes, precio menor, precio mayor o nombre.
  - Si no hay resultados veo "No hay productos con estos filtros".

### HU-06 · Ver el detalle de un producto
**Como** comprador **quiero** ver todas las fotos y la información de un producto **para** decidir si me interesa.

- **Prioridad:** Alta · **Requisitos:** RF-12, RF-13
- **Criterios de aceptación:**
  - Puedo recorrer la galería de fotos.
  - Veo precio, descripción, condición, ubicación, vendedor y fecha de publicación.
  - Veo productos relacionados de la misma categoría.

### HU-07 · Guardar favoritos
**Como** comprador **quiero** guardar productos en favoritos **para** revisarlos más tarde.

- **Prioridad:** Media · **Requisitos:** RF-22, RF-23
- **Criterios de aceptación:**
  - Desde el detalle puedo agregar o quitar un favorito.
  - En "Mis favoritos" veo solo los productos que siguen activos.

### HU-08 · Contactar al vendedor
**Como** comprador **quiero** enviar un mensaje al vendedor **para** preguntar por el producto y acordar la entrega.

- **Prioridad:** Alta · **Requisitos:** RF-24, RF-26, RF-27
- **Criterios de aceptación:**
  - Desde el detalle pulso "Contactar vendedor" y se abre la conversación de ese producto.
  - No puedo enviarme mensajes a mí mismo.
  - Veo un contador con los mensajes nuevos.

### HU-09 · Compartir un producto
**Como** comprador **quiero** compartir el enlace de un producto por WhatsApp u otras apps **para** mostrárselo a otras personas.

- **Prioridad:** Media · **Requisitos:** RF-28
- **Criterios de aceptación:**
  - El botón "Compartir" está en el detalle y en las tarjetas.
  - Puedo copiar el enlace, compartir por WhatsApp o usar el menú nativo del dispositivo (si existe).
  - Se comparte el enlace real `https://<dominio>/producto/ID`.

### HU-10 · Ver el perfil de un vendedor
**Como** comprador **quiero** ver el perfil público de un vendedor **para** conocer sus otras publicaciones.

- **Prioridad:** Baja · **Requisitos:** RF-31
- **Criterios de aceptación:**
  - Veo nombre, foto, ubicación, fecha de registro y sus publicaciones activas.

---

## Vendedor

### HU-11 · Publicar un producto
**Como** vendedor **quiero** publicar un producto con fotos, precio y descripción **para** venderlo.

- **Prioridad:** Alta · **Requisitos:** RF-14, RF-21
- **Criterios de aceptación:**
  - Todos los campos son obligatorios y el precio no puede ser negativo.
  - Puedo subir hasta 10 fotos JPG, PNG o WEBP.
  - Las fotos se comprimen antes de enviarse y se ven desde cualquier dispositivo.
  - Al publicar, se abre el detalle del producto.

### HU-12 · Administrar mis publicaciones
**Como** vendedor **quiero** ver todas mis publicaciones con su estado **para** gestionarlas.

- **Prioridad:** Alta · **Requisitos:** RF-15
- **Criterios de aceptación:**
  - Veo cada publicación con estado "Activo" o "Vendido".
  - Tengo acciones Ver, Compartir, Editar, Marcar vendido y Eliminar.

### HU-13 · Editar mi publicación
**Como** vendedor **quiero** editar la información y las fotos de mi publicación **para** mantenerla actualizada.

- **Prioridad:** Alta · **Requisitos:** RF-16, RF-17, RF-20
- **Criterios de aceptación:**
  - Puedo cambiar título, categoría, precio, condición, ubicación y descripción.
  - Puedo agregar fotos y eliminar fotos individuales (excepto la última).
  - Si intento editar una publicación ajena, el sistema lo rechaza.

### HU-14 · Marcar como vendido
**Como** vendedor **quiero** marcar mi producto como vendido **para** que deje de aparecer en el catálogo.

- **Prioridad:** Media · **Requisitos:** RF-18
- **Criterios de aceptación:**
  - Se pide confirmación.
  - La publicación deja de aparecer en el catálogo y en favoritos.
  - Solo el dueño puede hacerlo.

### HU-15 · Eliminar mi publicación
**Como** vendedor **quiero** eliminar mi publicación **para** retirarla definitivamente.

- **Prioridad:** Alta · **Requisitos:** RF-19, RF-20
- **Criterios de aceptación:**
  - Se pide confirmación ("Esta acción no se puede deshacer").
  - Se eliminan también sus fotos, favoritos y mensajes.
  - Un usuario no puede eliminar publicaciones de otro, ni siquiera enviando la petición manualmente (error 403).

### HU-16 · Responder a compradores
**Como** vendedor **quiero** responder los mensajes que recibo sobre mis productos **para** cerrar la venta.

- **Prioridad:** Alta · **Requisitos:** RF-25, RF-26
- **Criterios de aceptación:**
  - Veo mis conversaciones agrupadas por producto y por comprador.
  - Al abrir una conversación, sus mensajes se marcan como leídos.

### HU-17 · Editar mi perfil
**Como** vendedor **quiero** actualizar mi nombre, ubicación y foto **para** generar confianza en los compradores.

- **Prioridad:** Media · **Requisitos:** RF-29, RF-30
- **Criterios de aceptación:**
  - Puedo cambiar nombre, ubicación y foto.
  - No puedo cambiar mi correo ni mi rol.

---

## Administrador

### HU-18 · Ver todas las publicaciones
**Como** administrador **quiero** ver todas las publicaciones de la plataforma **para** revisar que cumplan las reglas.

- **Prioridad:** Alta · **Requisitos:** RF-32, RF-37
- **Criterios de aceptación:**
  - Accedo desde el enlace "🛡️ Admin", visible solo para mí.
  - Veo publicaciones activas y vendidas con vendedor y correo.
  - Puedo buscar por título, vendedor o correo y filtrar por estado.
  - Un usuario normal que entre a `/admin` o a `/api/admin/*` es rechazado.

### HU-19 · Eliminar publicaciones que incumplen las reglas
**Como** administrador **quiero** eliminar cualquier publicación **para** retirar contenido inapropiado.

- **Prioridad:** Alta · **Requisitos:** RF-33, RF-35, RF-36
- **Criterios de aceptación:**
  - Veo el recuadro "Acciones de administrador" en publicaciones ajenas.
  - Antes de eliminar, un aviso indica que es una acción administrativa y muestra el dueño.
  - La acción queda registrada en los logs del servidor.

### HU-20 · Editar contenido ajeno
**Como** administrador **quiero** editar publicaciones de otros usuarios y quitar fotos inapropiadas **para** corregir contenido sin eliminarlo.

- **Prioridad:** Media · **Requisitos:** RF-34, RF-35
- **Criterios de aceptación:**
  - Al editar contenido ajeno veo la franja "Modo administrador".
  - El dueño de la publicación no cambia.
  - No puedo marcar como vendida una publicación ajena.
