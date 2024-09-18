const WebSocket = require("ws");
const authenticationTimeout = 3000;
const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidV4 } = require("uuid");
const { subList, token, getUserId } = require("./hooks");

const isNotDevelop = process.env.NODE_ENV !== 'develop'
const sockets = {};
module.exports = ({ app, server, secret }) => {
  const wss = new WebSocket.Server({ server });
  
  app.post("/verify", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const userId = req.body.userId;

    try {
      if (isNotDevelop) 
        jwt.verify(token, process.env.token_secret);
  

      sockets[userId].isAuth = true;
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(401);
    }
  });

  wss.on("connection", async (ws, req) => {
    let userId = "1"
    if (isNotDevelop) {
      const auth = await token({ secret });
      userId = await getUserId({ auth });
    }

    sockets[userId] = { socket: ws, isAuth: false };
    ws.send(
      JSON.stringify({
        type: "verify-with-id",
        userId,
      }),
    );

    ws.on("close", () => {
      if (sockets[userId]) delete sockets[userId];
    });
    
    const authTimeout = setTimeout(() => {
      if (sockets[userId].isAuth) return;
      ws.close();
      delete sockets[userId];
    }, 2000);

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  return sockets;
};
