require('dotenv').config();

const express = require('express');
const http = require('http');
const crypto = require('crypto');

const wss = require('./websocket') 
const { readAndParseStream } = require("./helpers")
const { subEvent, token, subList, webhook } = require('./hooks') 

const app = express();
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.use(express.raw({   
    type: 'application/json'
})) 

app.get("/", async (req, res) => {
	const isSuccess = await init()
	if (isSuccess) return res.render('index', { 
		websocketUrl: process.env.WEBSOCKET_URL
	})

	res.render('auth', {
	   	clientId: process.env.CLIENT_ID,
		redirectUri: process.env.CALLBACK_URL 
	});
})

const socket = wss({ server })

const init = async () => {
	const secret = crypto.randomBytes(32).toString('hex');
	const auth = await token({ secret })
	const isSubbed = await subList({ auth })
	
	if (!isSubbed) {		
		const eventRes = await subEvent({ auth, secret })
		if (eventRes.status > 399 && eventRes.status < 405) return
	}

	webhook({ socket, secret, app })
	return true
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
