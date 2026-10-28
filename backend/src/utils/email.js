const nodemailer = require("nodemailer");

function correoConfigurado() {
  return Boolean(
    process.env.MAIL_HOST &&
      process.env.MAIL_USER &&
      process.env.MAIL_PASSWORD &&
      process.env.MAIL_FROM &&
      process.env.FRONTEND_ORIGIN
  );
}

async function enviarCorreoRecuperacion(usuario, token) {
  if (!correoConfigurado()) {
    throw new Error("Falta configurar el servicio de correo.");
  }

  const frontend = new URL(process.env.FRONTEND_ORIGIN);
  if (
    !["https:", "http:"].includes(frontend.protocol) ||
    frontend.username ||
    frontend.password ||
    (process.env.NODE_ENV === "production" && frontend.protocol !== "https:")
  ) {
    throw new Error("FRONTEND_ORIGIN debe ser una dirección HTTPS válida.");
  }

  const resetUrl = new URL("/recuperar-contrasena", frontend.origin);
  resetUrl.searchParams.set("token", token);
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT || 587) === 465,
    requireTLS: Number(process.env.MAIL_PORT || 587) !== 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: usuario.email,
    subject: "Recupera tu contraseña de SHOPPY T&M",
    text: `Hola ${usuario.nombre},\n\nPara cambiar tu contraseña, abre este enlace. Vence en 30 minutos y solo se puede usar una vez:\n${resetUrl}\n\nSi no pediste este cambio, ignora este correo.`,
    html: `<p>Hola,</p><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta de SHOPPY T&amp;M.</p><p><a href="${resetUrl}">Crear una contraseña nueva</a></p><p>El enlace vence en 30 minutos y solo se puede usar una vez. Si no pediste este cambio, ignora este correo.</p>`,
  });
}

module.exports = { enviarCorreoRecuperacion, correoConfigurado };
