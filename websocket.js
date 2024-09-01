const WebSocket = require("ws");

module.exports = ({ server }) => {
  const wss = new WebSocket.Server({ server });
  const socket = {};

  wss.on("connection", (ws) => {
    socket.user = ws;
 		const pingInterval = setInterval(() => {
    	if (ws.readyState === WebSocket.OPEN) { 
      	ws.ping(); 
    	} else {
      	clearInterval(pingInterval); 
    	}
  	}, 30000); 


    ws.on("close", () => {
      socket.user = null;
    });
  });

  return socket;
};
