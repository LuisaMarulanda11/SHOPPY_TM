const { fail } = require("../utils/response");

function requireAuth(req, res, next) {
  if (!req.session?.usuarioId) {
    return fail(res, "No autenticado", 401);
  }
  next();
}

module.exports = { requireAuth };
