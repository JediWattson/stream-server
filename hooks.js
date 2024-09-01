const crypto = require('crypto');
const express = require('express')
const secret = crypto.randomBytes(32).toString('hex');

const { readAndParseStream } = require("./helpers")

const auth = async ({ secret }) => {
    const data = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "client_credentials",
    })

    const res = await fetch('https://id.twitch.tv/oauth2/token', {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data
    })

	return readAndParseStream(res.body)
}

const subEvent = async ({ authRes, secret }) => {
    const res = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authRes.access_token}`,
            "Content-Type": "application/json",
            "Client-Id": process.env.CLIENT_ID, 
        },
        body: JSON.stringify({
            type: "channel.follow",
            version: 2,
            condition: {
                broadCaster_user_id: process.env.BROADCASTER_USER_ID,
                moderator_user_id: process.env.BROADCASTER_USER_ID
            },
            transport: {
                method: 'webhook',
                callback: `${process.env.CALLBACK_URL}`,
                secret
            }
        })
    });

    return readAndParseStream(res.body)
}

const webhook = ({ app, secret, socket }) => {
    app.use('/webhook', express.json({
        verify: (req, res, buf) => {
            if (process.env.NODE_ENV === "develop") return;
        
            const messageId = req.header('Twitch-Eventsub-Message-Id');
            const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
            const signature = req.header('Twitch-Eventsub-Message-Signature');
            const hmacMessage = messageId + timestamp + buf;
            const expectedSignature = 'sha256=' + crypto.createHmac('sha256', secret)
                                                   .update(hmacMessage)
                                                   .digest('hex');
            if (signature !== expectedSignature) {
                throw new Error('Invalid Twitch webhook signature');
            }
        }
    }));

    app.post('/webhook', (req, res) => {
        const messageType = req.header('Twitch-Eventsub-Message-Type');
        const message = req.body;
        if (messageType === 'webhook_callback_verification') 
            return res.status(200).send(message.challenge);
                
        if (messageType === 'notification') {
            const eventType = message.subscription.type;
            const eventData = message.event;
            const messageToSend = JSON.stringify({ type: eventType, data: eventData });
            if (socket.readyState !== WebSocket.OPEN) return;
                    
            socket.send(messageToSend);
        } 
        
        res.status(204).end();
    });
}

module.exports = { auth, webhook, subEvent }
