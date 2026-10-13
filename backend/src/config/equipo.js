/**
 * Integrantes del grupo mostrados en /equipo.
 * - foto: archivo en frontend/public/assets/equipo/
 * - usuario_id: id de su cuenta en la tabla usuarios; sus publicaciones activas
 *   se muestran en su tarjeta. (Se usa el id y no el correo porque el repositorio es público.)
 */
module.exports = [
  { nombre: "Luisa", rol: "Integrante", foto: "/assets/equipo/luisa.jpg", usuario_id: 5 },
  { nombre: "Mateo", rol: "Integrante", foto: "/assets/equipo/mateo.jpg", usuario_id: 6 },
  { nombre: "Juan David", rol: "Integrante", foto: "/assets/equipo/juan-david.jpg", usuario_id: 2 },
  { nombre: "Camilo", rol: "Integrante", foto: "/assets/equipo/camilo.jpg", usuario_id: 1 },
];
