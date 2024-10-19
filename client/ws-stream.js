const subscriptions = document.getElementById("subscriptions");
const actionStreamStatus = document.getElementById("action-stream-status");

const setDisconnected = () => {
  actionStreamStatus.status = statusStatesEnum.DISCONNECTED;
  subscriptions.empty();
};

const setConnected = () => {
  actionStreamStatus.status = statusStatesEnum.CONNECTED;
};

let websocket;
let connected;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
async function handleSubmit(payload) {
  const token = payload.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  //const res = await fetch("/subscription-list", { headers });
  //const list = await res.json()

  const list = [{ type: "new-follower-event", label: "New Follower Event" }];
  subscriptions.data = list;

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

    handleMessage(data);
  };

  websocket.onopen = function () {
    reconnectAttempts = 0;
    connected = true;
    setConnected();
  };

  websocket.onclose = function () {
    websocket = null;
    reconnectAttempts++;
    connected = false;
    setDisconnected();
    if (reconnectAttempts <= maxReconnectAttempts) {
      const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000);
      setTimeout(() => !connected && handleSubmit(payload), delay);
    }
  };

  websocket.onping = () => {
    websocket.pong();
  };

  websocket.onerror = function (event) {
    console.error("WebSocket error occurred:", event);
  };
}

const streamForm = document.getElementById("stream-login");
streamForm.onSubmit = handleSubmit;
