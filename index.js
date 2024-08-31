const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Twitch webhook secret (replace with your actual secret)
const TWITCH_WEBHOOK_SECRET = 'your_twitch_webhook_secret';

// Store connected WebSocket clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
});

// Handle Twitch webhooks
app.use('/webhook', express.json({
  verify: (req, res, buf) => {
    // Verify Twitch webhook signature
    const messageId = req.header('Twitch-Eventsub-Message-Id');
    const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
    const signature = req.header('Twitch-Eventsub-Message-Signature');
    const hmacMessage = messageId + timestamp + buf;
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', TWITCH_WEBHOOK_SECRET)
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

  if (messageType === 'notification') {
    // Handle Twitch event notification
    const eventType = message.subscription.type;
    const eventData = message.event;

    // Broadcast event to connected WebSocket clients
    const messageToSend = JSON.stringify({ type: eventType, data: eventData });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageToSend);
      }
    });
  } else if (messageType === 'webhook_callback_verification') {
    // Respond to Twitch webhook challenge
    res.status(200).send(message.challenge);
  } else {
    res.status(204).end(); // Ignore other message types
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
