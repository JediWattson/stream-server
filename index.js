require('dotenv').config();

const express = require('express');
const http = require('http');
const crypto = require('crypto');

const wss = require('./websocket') 
const { readAndParseStream } = require("./helpers")
const { subEvent, auth, webhook } = require('./hooks') 

const app = express();
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.use(express.raw({   
    type: 'application/json'
})) 

app.get("/", async (req, res) => {
	const isSuccess = await init()
	if (isSuccess) return res.render('index')

	res.render('auth', {
	   	clientId: process.env.CLIENT_ID,
		redirectUri: process.env.CALLBACK_URL 
	});
})

const init = async () => {
	const secret = crypto.randomBytes(32).toString('hex');

	const socket = wss({ server })
	const authRes = await auth({ secret })
	const eventRes = await subEvent({ authRes, secret })
	console.log(authRes, eventRes)
	if (eventRes.status > 399) return

	webhook({ socket, secret, app })
	return true
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
