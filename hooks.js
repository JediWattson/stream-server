const crypto = require("crypto");
const express = require("express");
const secret = crypto.randomBytes(32).toString("hex");

const { readAndParseStream } = require("./helpers");

const token = async ({ secret }) => {
  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });

  return readAndParseStream(res.body);
};

const delSub = async ({ auth, subId }) => {
	const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subId}`,
		{
			method: "delete",
			headers: {
	      Authorization: `Bearer ${auth.access_token}`,
  	    "Client-Id": process.env.CLIENT_ID,
    	}
		},
  );

	if (response.status !== 204)
		throw Error("sub didn't delete :(")
};


const subList = async ({ auth }) => {
	const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions?type=channel.follow",						
		{
			headers: {
	      Authorization: `Bearer ${auth.access_token}`,
  	    "Client-Id": process.env.CLIENT_ID,
    	}
		},
  );

  return readAndParseStream(response.body);
};

const subEvent = async ({ auth, secret }) => {
  const res = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": "application/json",
        "Client-Id": process.env.CLIENT_ID,
      },
      body: JSON.stringify({
        type: "channel.follow",
        version: 2,
        condition: {
          broadCaster_user_id: process.env.BROADCASTER_USER_ID,
          moderator_user_id: process.env.BROADCASTER_USER_ID,
        },
        transport: {
          method: "webhook",
          callback: `${process.env.CALLBACK_URL}`,
          secret,
        },
      }),
    },
  );

  return readAndParseStream(res.body);
};

const webhook = ({ app, secret, socket }) => {
  app.use(
    "/webhook",
    express.json({
      verify: (req, res, buf) => {
				console.log(secret)
				const messageId = req.header("Twitch-Eventsub-Message-Id");
        const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
        const signature = req.header("Twitch-Eventsub-Message-Signature");
        const hmacMessage = messageId + timestamp + req.body;
        const expectedSignature = "sha256=" + crypto.createHmac("sha256", secret)
						.update(hmacMessage)
						.digest("hex");

				console.log(signature, expectedSignature)
        if (signature !== expectedSignature) {
					res.sendStatus(403)
          throw new Error("Invalid Twitch webhook signature");
        }
      },
    }),
  );

  app.post("/webhook", (req, res) => {
    const messageType = req.header("Twitch-Eventsub-Message-Type");
		console.log(messageType)
		const message = JSON.parse(req.body.toString());
    if (messageType === "webhook_callback_verification")
      return res.status(200).send(message.challenge);

    if (messageType === "notification") {
      const eventType = message.subscription.type;
      const eventData = message.event;
      const messageToSend = JSON.stringify({
        type: eventType,
        data: eventData,
      });
      socket.user.send(messageToSend);
    }

    res.sendStatus(204);
	});
};

module.exports = { token, webhook, subEvent, subList, delSub };
