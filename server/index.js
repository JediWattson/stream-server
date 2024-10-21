require("dotenv").config();
const PORT = process.env.PORT || 4000;

const cookieParser = require('cookie-parser')
const path = require("path");
const http = require("http");
const express = require("express");
const crypto = require("crypto");

const authRoute = require('./routes/auth')
const db = require("./db");
const wss = require("./websocket");
const subscriptions = require("./subscriptions");
const { webhook, delSub, subEvent, token, subList } = require("./hooks");


const initServer = async () => {
  const models = await db()
  const app = express();
  const server = http.createServer(app);
  const secret = crypto.randomBytes(32).toString("hex");

  app.use(cookieParser())
  app.use(express.json());
  app.use(express.raw({ type: "application/json" }));

  app.use("/static", express.static(path.join(__dirname, "..", "client")));
  app.set("views", "./client/pages");
  app.set("view engine", "ejs");

  const { verify } = authRoute({ app, models })
  const sockets = wss({ verify, server, app, secret });
  webhook({ sockets, app, secret });
  subscriptions({ app, secret });

  app.get(["/", "/new-user"], (_, res) => {
    res.render("index");
  });
  
  app.get("/browser-source", (req, res) => {
    res.render(`sources/${req.query.sourcePath}`);
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}


initServer()
