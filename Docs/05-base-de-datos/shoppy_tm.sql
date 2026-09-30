-- =====================================================================
--  SHOPPY T&M — Script de base de datos (MySQL 5.7+ / 8.x)
--  Crea todas las tablas, relaciones y datos iniciales.
--
--  Uso local (XAMPP / MySQL):
--    1. Descomenta las dos líneas de CREATE DATABASE / USE.
--    2. Ejecuta el script completo en phpMyAdmin o con:
--         mysql -u root -p < shoppy_tm.sql
--
--  En Clever Cloud la base ya existe: ejecuta el script sin esas líneas.
--  Las contraseñas de los usuarios se guardan con hash bcrypt desde la
--  aplicación; este script NO crea usuarios ni contiene contraseñas.
-- =====================================================================

-- CREATE DATABASE IF NOT EXISTS shoppy_tm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE shoppy_tm;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
--  Tabla: usuarios
--  rol: 'usuario' (comprador/vendedor) o 'admin' (administrador)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL UNIQUE,
  password       VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
  foto           VARCHAR(255) DEFAULT NULL,
  ubicacion      VARCHAR(190) DEFAULT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo         TINYINT(1) NOT NULL DEFAULT 1,
  rol            ENUM('usuario','admin') NOT NULL DEFAULT 'usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
--  Tabla: categorias
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
--  Tabla: publicaciones
--  estado: 'activo' o 'vendido'
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publicaciones (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT NOT NULL,
  categoria_id      INT NOT NULL,
  titulo            VARCHAR(200) NOT NULL,
  descripcion       TEXT NOT NULL,
  precio            DECIMAL(12,2) NOT NULL DEFAULT 0,
  foto              VARCHAR(255) DEFAULT NULL COMMENT 'Foto principal',
  condicion         VARCHAR(80) NOT NULL,
  ubicacion         VARCHAR(190) NOT NULL,
  estado            VARCHAR(40) NOT NULL DEFAULT 'activo',
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pub_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id),
  CONSTRAINT fk_pub_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
--  Tabla: fotos_publicacion (galería de cada publicación)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fotos_publicacion (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  foto           VARCHAR(255) NOT NULL COMMENT 'URL pública (Vercel Blob) o uploads/<archivo>',
  fecha          DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_foto_pub FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
--  Tabla: favoritos (relación N:M usuarios <-> publicaciones)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favoritos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT NOT NULL,
  publicacion_id INT NOT NULL,
  fecha          DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (usuario_id, publicacion_id),
  CONSTRAINT fk_fav_usuario FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)      ON DELETE CASCADE,
  CONSTRAINT fk_fav_pub     FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
--  Tabla: mensajes (conversaciones comprador <-> vendedor por publicación)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensajes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  remitente_id    INT NOT NULL,
  destinatario_id INT NOT NULL,
  publicacion_id  INT NOT NULL,
  mensaje         TEXT NOT NULL,
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  leido           TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_msg_rem  FOREIGN KEY (remitente_id)    REFERENCES usuarios(id)      ON DELETE CASCADE,
  CONSTRAINT fk_msg_dest FOREIGN KEY (destinatario_id) REFERENCES usuarios(id)      ON DELETE CASCADE,
  CONSTRAINT fk_msg_pub  FOREIGN KEY (publicacion_id)  REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
--  Datos iniciales: categorías
-- ---------------------------------------------------------------------
INSERT IGNORE INTO categorias (id, nombre) VALUES
  (1, 'Tecnología'),
  (2, 'Hogar'),
  (3, 'Ropa y Accesorios'),
  (4, 'Deportes'),
  (5, 'Vehículos'),
  (6, 'Entretenimiento'),
  (7, 'Libros'),
  (8, 'Otros');

-- ---------------------------------------------------------------------
--  Administrador principal
--  La cuenta debe existir (registrada desde la aplicación). Esta sentencia
--  solo le asigna el rol; no crea la cuenta ni toca su contraseña.
-- ---------------------------------------------------------------------
UPDATE usuarios SET rol = 'admin' WHERE email = 'camilotobon34@gmail.com';

-- ---------------------------------------------------------------------
--  Migración para bases existentes creadas sin la columna rol
--  (ejecutar una sola vez; equivalente a: npm run rol:admin)
-- ---------------------------------------------------------------------
-- ALTER TABLE usuarios ADD COLUMN rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario';
-- UPDATE usuarios SET rol = 'admin' WHERE email = 'camilotobon34@gmail.com';
