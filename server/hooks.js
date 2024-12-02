const express = require("express");

const webhook = ({ app, secret, sockets }) => {
  app.use(
    "/webhook",
    express.json({
      verify: (req, res) => {
        const messageId = req.header("Twitch-Eventsub-Message-Id");
        const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
        const signature = req.header("Twitch-Eventsub-Message-Signature");
        const hmacMessage = messageId + timestamp + req.body;
        const expectedSignature =
          "sha256=" +
          crypto.createHmac("sha256", secret).update(hmacMessage).digest("hex");

        if (signature !== expectedSignature) {
          res.sendStatus(403);
          throw new Error("Invalid Twitch webhook signature");
        }
      },
    }),
  );

  app.post("/webhook", (req, res) => {
    const messageType = req.header("Twitch-Eventsub-Message-Type");
    const message = req.body;
    if (messageType === "webhook_callback_verification")
      return res.status(200).send(message.challenge);

    if (messageType === "notification") {
      const eventType = message.subscription.type;
      const eventData = message.event;
      const userId = eventData.broadcaster_user_id;
      const user = sockets[userId];
      if (!user?.isAuth) return;

      const messageToSend = JSON.stringify({
        type: eventType,
        data: eventData,
      });
      user.socket.send(messageToSend);
    }

    res.sendStatus(204);
  });
};

module.exports = webhook;
