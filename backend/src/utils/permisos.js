function esDueno(usuario, publicacion) {
  return !!usuario && !!publicacion && Number(publicacion.usuario_id) === Number(usuario.id);
}

function esAdmin(usuario) {
  return usuario?.rol === "admin";
}

/** Dueño o administrador: puede editar, eliminar y administrar fotos. */
function puedeAdministrar(usuario, publicacion) {
  return esDueno(usuario, publicacion) || esAdmin(usuario);
}

module.exports = { esDueno, esAdmin, puedeAdministrar };
