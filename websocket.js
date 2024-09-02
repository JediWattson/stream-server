const WebSocket = require("ws");
const authenticationTimeout = 3000;
const express = require("express");
const jwt = require('jsonwebtoken');
const { v4: uuidV4 } = require("uuid")
const { token, getUserId } = require('./hooks')

const sockets = {};
module.exports = ({ app, server, secret }) => {
  const wss = new WebSocket.Server({ server });

	app.post('/verify', (req, res) => {
  	const token = req.headers.authorization?.split(' ')[1];
		const userId = req.body.userId;
		
		try {
    	const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
			sockets[userId].isAuth = true; 
	    res.sendStatus(200); 
  	} catch (err) {
			console.error(err)
    	res.sendStatus(401); 
	  }
	});

  wss.on("connection", async (ws, req) => {
		const auth = await token({ secret })
		const userId = await getUserId({ auth })
		sockets[userId]= { socket: ws, isAuth: false }
		ws.send(JSON.stringify({
			type: "verify-with-id",
			userId
		}))
		ws.on("close", () => {
			if(sockets[userId])
				delete sockets[userId]
		});
  
		const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
	});
	
	return sockets
};
