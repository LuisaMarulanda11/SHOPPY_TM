const path = require("path");
const multer = require("multer");
const fs = require("fs");

const uploadsDir =
  process.env.UPLOADS_DIR ||
  (process.env.VERCEL
    ? path.join("/tmp", "shoppy-uploads")
    : path.join(__dirname, "../../uploads"));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function fileFilter(_req, file, cb) {
  const ok = /\.(jpe?g|png|webp)$/i.test(file.originalname);
  cb(ok ? null : new Error("Formato no permitido. Usa JPG, PNG o WEBP."), ok);
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = { upload, uploadsDir };
