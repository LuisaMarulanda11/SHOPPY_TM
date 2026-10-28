const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

process.env.MAIL_HOST = "smtp.example.invalid";
process.env.MAIL_PORT = "587";
process.env.MAIL_USER = "test@example.invalid";
process.env.MAIL_PASSWORD = "not-a-real-password";
process.env.MAIL_FROM = "SHOPPY <test@example.invalid>";
process.env.FRONTEND_ORIGIN = "https://shoppy.example.invalid";

const nodemailer = require("nodemailer");
let emailSent;
nodemailer.createTransport = () => ({
  sendMail: async (message) => {
    emailSent = message;
  },
});

const pool = require("../src/db");
const authRoutes = require("../src/routes/auth");
let tokenHash;
let passwordHash;
let tokenConsumed = false;
let emailExists = true;
let tableReady = false;
let tableCreationCount = 0;

pool.query = async (sql, params = []) => {
  if (sql.includes("CREATE TABLE IF NOT EXISTS password_reset_tokens")) {
    tableReady = true;
    tableCreationCount += 1;
    return [{ warningStatus: 0 }];
  }
  if (sql.includes("SELECT id, nombre, email FROM usuarios")) {
    return [emailExists ? [{ id: 8, nombre: "Prueba", email: params[0] }] : []];
  }
  if (sql.includes("SELECT id FROM password_reset_tokens")) return [[]];
  if (sql.includes("INSERT INTO password_reset_tokens")) {
    tokenHash = params[1];
    tokenConsumed = false;
    return [{ insertId: 1 }];
  }
  if (sql.includes("DELETE FROM password_reset_tokens")) {
    return [{ affectedRows: 1 }];
  }
  throw new Error(`Consulta no esperada en prueba: ${sql}`);
};

pool.getConnection = async () => ({
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  release: () => {},
  query: async (sql, params = []) => {
    if (sql.includes("SELECT usuario_id FROM password_reset_tokens")) {
      return [
        !tokenConsumed && tokenHash === params[0] ? [{ usuario_id: 8 }] : [],
      ];
    }
    if (sql.includes("UPDATE usuarios SET password")) {
      passwordHash = params[0];
      return [{ affectedRows: 1 }];
    }
    if (sql.includes("DELETE FROM password_reset_tokens")) {
      tokenConsumed = true;
      return [{ affectedRows: 1 }];
    }
    throw new Error(`Consulta transaccional no esperada en prueba: ${sql}`);
  },
});

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
const server = app.listen(0, "127.0.0.1");
const baseUrl = new Promise((resolve) => {
  server.once("listening", () => {
    resolve(`http://127.0.0.1:${server.address().port}/api/auth`);
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test("recuperación crea el token, cambia la clave y rechaza su reutilización", async () => {
  const base = await baseUrl;
  const invalid = await fetch(`${base}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "correo-invalido" }),
  });
  assert.equal(invalid.status, 400);

  const request = await fetch(`${base}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.invalid" }),
  });
  const requestBody = await request.json();
  assert.equal(request.status, 200);
  assert.equal(requestBody.ok, true);
  assert.match(requestBody.data.mensaje, /Si existe una cuenta/);
  assert.equal(emailSent.to, "test@example.invalid");
  assert.equal(tableReady, true);
  assert.equal(tableCreationCount, 1);

  const token = new URL(
    emailSent.text.match(/https:\/\/[^\s]+/)[0]
  ).searchParams.get("token");
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(
    tokenHash,
    crypto.createHash("sha256").update(token).digest("hex")
  );

  const mismatch = await fetch(`${base}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      password: "ExamplePassword123!",
      confirmar_password: "DifferentPassword123!",
    }),
  });
  assert.equal(mismatch.status, 400);

  const reset = await fetch(`${base}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      password: "ExamplePassword123!",
      confirmar_password: "ExamplePassword123!",
    }),
  });
  assert.equal(reset.status, 200, JSON.stringify(await reset.clone().json()));
  assert.equal((await reset.json()).ok, true);
  assert.equal(
    await bcrypt.compare("ExamplePassword123!", passwordHash),
    true
  );

  const reused = await fetch(`${base}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      password: "AnotherPassword123!",
      confirmar_password: "AnotherPassword123!",
    }),
  });
  assert.equal(reused.status, 400);

  emailExists = false;
  const unknownAccount = await fetch(`${base}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "absent@example.invalid" }),
  });
  assert.equal(unknownAccount.status, 200);
  assert.match((await unknownAccount.json()).data.mensaje, /Si existe una cuenta/);
  assert.equal(emailSent.to, "test@example.invalid");
});
