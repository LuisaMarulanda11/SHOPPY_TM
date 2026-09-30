# Documentación de SHOPPY T&M

<p align="center">
  <img src="01-logos/logo.jpeg" alt="Logo SHOPPY T&M" width="160" />
</p>

**SHOPPY T&M** es un marketplace web (PWA) de productos de segunda mano: las personas publican lo que ya no usan, otros lo encuentran, lo guardan en favoritos y contactan al vendedor por mensajería interna.

> _"Lo que ya no necesitas... puede tener una segunda vida."_

## Estructura de la documentación

```
Docs/
├── README.md                              ← este índice
├── 01-logos/                              Logo e íconos de la aplicación
├── 02-historias-de-usuario/               Historias por rol
├── 03-requisitos/
│   ├── roles-y-permisos.md                Roles y matriz de permisos
│   ├── requisitos-funcionales.md          RF-01 a RF-37
│   └── requisitos-no-funcionales.md       RNF-01 a RNF-23
├── 04-modelo-entidad-relacion/            Diagrama E-R, entidades y relaciones
└── 05-base-de-datos/
    └── shoppy_tm.sql                      Script SQL (MySQL) de la base de datos
```

| # | Sección | Documento |
|---|---|---|
| 01 | Logos | [01-logos](01-logos/) |
| 02 | Historias de usuario | [historias-de-usuario.md](02-historias-de-usuario/historias-de-usuario.md) |
| 03 | Roles y permisos | [roles-y-permisos.md](03-requisitos/roles-y-permisos.md) |
| 03 | Requisitos funcionales | [requisitos-funcionales.md](03-requisitos/requisitos-funcionales.md) |
| 03 | Requisitos no funcionales | [requisitos-no-funcionales.md](03-requisitos/requisitos-no-funcionales.md) |
| 04 | Modelo entidad-relación | [modelo-entidad-relacion.md](04-modelo-entidad-relacion/modelo-entidad-relacion.md) |
| 05 | Script de base de datos | [shoppy_tm.sql](05-base-de-datos/shoppy_tm.sql) |

## Roles del sistema

| Rol | Descripción breve |
|---|---|
| **Visitante** | Persona sin sesión. Puede registrarse e iniciar sesión. |
| **Comprador** | Usuario registrado que explora, busca, guarda favoritos y contacta vendedores. |
| **Vendedor** | Usuario registrado que publica y administra sus propios productos. |
| **Administrador** | Modera el contenido: puede editar o eliminar publicaciones de cualquier usuario. |

> Comprador y Vendedor son la **misma cuenta** (`rol = 'usuario'` en la base de datos): cualquier usuario registrado puede comprar y vender. El Administrador tiene `rol = 'admin'`.

## Arquitectura

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 + PWA (`vite-plugin-pwa`) |
| Backend | Node.js + Express (API REST, respuestas `{ ok, data, error }`) |
| Base de datos | MySQL (Clever Cloud) |
| Almacenamiento de fotos | Vercel Blob (en local: `backend/uploads/`) |
| Sesiones | Cookie firmada (`cookie-session`) |
| Despliegue | Vercel (proyecto frontend + proyecto backend) |

## Estructura del repositorio

```
SHOPPY_TM/
├── backend/     API Express: rutas, middleware, scripts y schema SQL
├── frontend/    Aplicación React (PWA)
└── Docs/        Documentación del proyecto
```
