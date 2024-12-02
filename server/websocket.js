const WebSocket = require("ws");
const { token, getUserId } = require("./helpers");
const isNotDevelop = process.env.NODE_ENV !== "develop";
const sockets = {};

module.exports = ({ app, verify, server, secret }) => {
  const wss = new WebSocket.Server({ server });

  app.post("/verify", verify, async (req, res) => {
    try {
      const userId = req.body.userId;
      sockets[userId].isAuth = true;
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  wss.on("connection", async (ws) => {
    let userId = "1";
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
      if (!sockets[userId]) return;

      if (sockets[userId].isOnline) {
      }

      delete sockets[userId];
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
