const crypto = require("crypto");
const express = require("express");
const router = express.Router();

const middleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const tokenBuffer = Buffer.from(token, "base64");
  req.auth = tokenBuffer.toString("utf8").split(":");
  next();
};

const algo = "aes-256-gcm";
const key = crypto.randomBytes(32);

const encryptToken = (payload) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algo, key, iv);
  const enc =
    cipher.update(JSON.stringify(payload), "utf8", "hex") + cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return [iv.toString("hex"), authTag, enc].join(":");
};

const decryptToken = (token) => {
  const [ivHex, authTagHex, enc] = token.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(algo, key, iv);
  decipher.setAuthTag(authTag);

  const dec = decipher.update(enc, "hex", "utf8") + decipher.final("utf8");
  return JSON.parse(dec);
};

const verify = (req, res, next) => {
  try {
    const encToken = req.cookies.token;
    if (!encToken) return res.sendStatus(401);
    const user = decryptToken(encToken);
    if (user.expiresAt < Date.now()) return res.sendStatus(401);
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(400);
  }
};

module.exports = (opts) => {
  const { app, models } = opts;

  router.use(middleware);

  router.get("/login", async (req, res) => {
    const [username, password] = req.auth;
    const user = await models.User.login(username, password);
    const token = encryptToken({
      userId: user.id,
      expiresAt: Date.now() + 3600,
    });
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.sendStatus(204);
  });

  router.get("/create", async (req, res) => {
    const [username, password] = req.auth;
    const noErrors = await models.User.create(username, password);
    if (!noErrors) return res.sendStatus(400);

    res.sendStatus(201);
  });

  app.use("/auth", router);
  return { verify };
};
