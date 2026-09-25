-- SHOPPY T&M schema for Clever Cloud
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  foto VARCHAR(255) DEFAULT NULL,
  ubicacion VARCHAR(190) DEFAULT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  categoria_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(12,2) NOT NULL DEFAULT 0,
  foto VARCHAR(255) DEFAULT NULL,
  condicion VARCHAR(80) NOT NULL,
  ubicacion VARCHAR(190) NOT NULL,
  estado VARCHAR(40) NOT NULL DEFAULT 'activo',
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pub_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_pub_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fotos_publicacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  foto VARCHAR(255) NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_foto_pub FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  publicacion_id INT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (usuario_id, publicacion_id),
  CONSTRAINT fk_fav_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_pub FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  remitente_id INT NOT NULL,
  destinatario_id INT NOT NULL,
  publicacion_id INT NOT NULL,
  mensaje TEXT NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  leido TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_msg_rem FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_dest FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_pub FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

INSERT IGNORE INTO categorias (id, nombre) VALUES
  (1, 'Tecnología'),
  (2, 'Hogar'),
  (3, 'Ropa y Accesorios'),
  (4, 'Deportes'),
  (5, 'Vehículos'),
  (6, 'Entretenimiento'),
  (7, 'Libros'),
  (8, 'Otros');
