require("dotenv").config();
const PORT = process.env.PORT || 4000;

const path = require("path");
const express = require("express");
const http = require("http");
const crypto = require("crypto");
const cookieParser = require('cookie-parser')

const authRoute = require('./routes/auth')
const subscriptions = require("./subscriptions");
const wss = require("./websocket");
const webhook = require("./hooks");
const db = require("./db");


const initServer = async () => {
  const models = await db()
  const app = express();
  const server = http.createServer(app);
  const secret = crypto.randomBytes(32).toString("hex");

  app.use(cookieParser())
  app.use(express.json());
  app.use("/static", express.static(path.join(__dirname, "..", "client")));
  app.set("views", "./client/pages/ejs");
  app.set("view engine", "ejs");

  const { verify } = authRoute({ app, models })
  const sockets = wss({ verify, server, app, secret });
  webhook({ sockets, app, secret });
  subscriptions({ verify, sockets, app, secret });

  app.get(["/", "/new-user"], (_, res) => {
    res.render("index");
  });
  
  app.get("/browser-source", (req, res) => {
    res.render(`static/sources/${req.query.sourcePath}`);
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}


initServer()
