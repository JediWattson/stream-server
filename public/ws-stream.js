let websocket;
let connected;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

async function connect() {
  const token = document.getElementById("secretKey").value || "";
	const headers = {
	  Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
 	}  
	
	const res = await fetch("/subscription-list", { headers });
	const list = await res.json()
	const listContainerElement = document.getElementById("subscriptions")
	const listElement = document.getElementById('sub-list') 

	while (listElement.lastElementChild) {
   	listElement.removeChild(listElement.lastElementChild);
 	}
	
	listContainerElement.style.display = 'Block'
	list.forEach(item => {
  	const listItem = document.createElement("li");
		const indicator = document.createElement("span");
						
		indicator.classList.add("indicator");
		indicator.style.backgroundColor = "green";
		indicator.id = item.type;
   	listItem.textContent = item.label;
   	listItem.appendChild(indicator);
		listElement.appendChild(listItem);
	});

	setDisconnected();
  wsServerStatus.textContent = "WebSocket Server: Authenticating";
	websocket = new WebSocket("/ws");	
  websocket.onmessage = async function (event) {
    const data = JSON.parse(event?.data);
    if (data.type === "verify-with-id") {
      const res = await fetch("/verify", {
        headers, 
        method: "POST",
        body: JSON.stringify({ userId: data.userId }),
      });

      if (res.status !== 200) setDisconnected();
      return;
    }

    window.handleMessage(data);
  };

  websocket.onopen = function (event) {
    reconnectAttempts = 0;
    connected = true;
    setConnected();
  };

  websocket.onclose = function (event) {
    websocket = null;
    reconnectAttempts++;
    connected = false;
    setDisconnected();
    if (reconnectAttempts <= maxReconnectAttempts) {
      const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);
      setTimeout(() => !connected && connect(), delay);
    } else {
      wsServerStatus.textContent = "WebSocket Server: Disconnected";
    }
  };

  websocket.onping = () => {
    websocket.pong();
  };

  websocket.onerror = function (event) {
    console.error("WebSocket error occurred:", event);
  };
}

const button = document.getElementById("secretButton");
button.addEventListener("click", () => !connected && connect());

