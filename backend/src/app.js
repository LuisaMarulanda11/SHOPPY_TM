require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { uploadsDir } = require("./middleware/upload");
const authRoutes = require("./routes/auth");
const catalogoRoutes = require("./routes/catalogo");
const productoRoutes = require("./routes/producto");
const publicacionesRoutes = require("./routes/publicaciones");
const favoritosRoutes = require("./routes/favoritos");
const mensajesRoutes = require("./routes/mensajes");
const perfilRoutes = require("./routes/perfil");
const adminRoutes = require("./routes/admin");

const app = express();

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const allowedOrigins = [
  FRONTEND_ORIGIN,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null,
].filter(Boolean);

app.set("trust proxy", 1);

if (!isProd) {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/i.test(new URL(origin).hostname)
      ) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// cookie-session: funciona en Vercel (sin store en memoria)
app.use(
  cookieSession({
    name: "shoppy.sid",
    keys: [process.env.SESSION_SECRET || "shoppy_secret"],
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
  })
);

// Compatibilidad: rutas usan req.session.usuarioId
app.use((req, _res, next) => {
  if (req.session && req.session.usuarioId && !req.session.usuario_id) {
    // noop — ya usamos usuarioId
  }
  next();
});

app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "shoppy-tm-api", vercel: !!process.env.VERCEL });
});

app.use("/api/auth", authRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/producto", productoRoutes);
app.use("/api/publicaciones", publicacionesRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/mensajes", mensajesRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({
    ok: false,
    data: null,
    error: err.message || "Error en la solicitud",
  });
});

module.exports = app;
