const WebSocket = require('ws');

module.exports = ({ server }) => {
	const wss = new WebSocket.Server({ server });
	const socket = {} 

	wss.on('connection', (ws) => {
 		console.log('New WebSocket client connected');
  		socket.user = ws

  		ws.on('close', () => {
    		console.log('WebSocket client disconnected');
	   	 	socket.user = null
  		});
	});

	return socket
}

