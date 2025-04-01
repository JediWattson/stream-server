require("dotenv").config();

const path = require("path");
const express = require("express");
const http = require("http");
const crypto = require("crypto");
const cookieParser = require('cookie-parser')

const authRoute = require('./routes/auth')
const subscriptions = require("./subscriptions");
const db = require("./db");
const webhook = require("./hooks");
const wss = require("./websocket");

const PORT = process.env.PORT || 4000;
const secret = crypto.randomBytes(32).toString("hex");

const initServer = async () => {
  const app = express()
  const server = http.createServer(app)
  const models = await db()

  app.use(cookieParser())
  app.use(express.json());
  app.use("/static", express.static(path.join(__dirname, "..", "client")));
  app.set("views", "./client/pages/ejs");
  app.set("view engine", "ejs");

  const { verify, checkToken } = authRoute({ app, models })
  const sockets = wss({ verify, server, app, secret });
  webhook({ sockets, app, secret });
  subscriptions({ verify, sockets, app, secret });

  app.get("/", (req, res) => {
    const user = checkToken(req.cookies.token)
    if (user) {
      res.writeHead(302, { 'Location': '/dashboard' });
      res.end()
      return
    }

    res.render("index", {
      title: "Sign In",
      controller: "index"
    });
  });
  
  app.get("/dashboard", (req, res) => {
    const user = checkToken(req.cookies.token)
    if (!user) {
      res.writeHead(302, { 'Location': '/' });
      res.end()
      return
    }

    res.render("index", {
      title: "Home",
      controller: "dashboard"
    });
  });

  app.get("/browser-source", (req, res) => {
    res.render(`static/sources/${req.query.sourcePath}`);
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}


initServer()
