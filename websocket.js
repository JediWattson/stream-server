const WebSocket = require('ws');

module.exports = ({ server }) => {
	const wss = new WebSocket.Server({ server });
	let socket 

	wss.on('connection', (ws) => {
 		console.log('New WebSocket client connected');
  		socket = ws

  		ws.on('close', () => {
    		console.log('WebSocket client disconnected');
	   	 	socket = null
  		});
	});

	return socket
}
