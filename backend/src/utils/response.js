function ok(res, data = null, status = 200) {
  return res.status(status).json({ ok: true, data, error: null });
}

function fail(res, error = "Error", status = 400, data = null) {
  return res.status(status).json({ ok: false, data, error });
}

/** Normalize DB photo paths to public /uploads/... URLs */
function publicUrl(path) {
  if (!path) return "";
  const s = String(path).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(s)) return s;
  const name = s.split("/").pop();
  return name ? `/uploads/${name}` : "";
}

function mapProduct(row) {
  if (!row) return row;
  return { ...row, foto: publicUrl(row.foto) };
}

module.exports = { ok, fail, publicUrl, mapProduct };
