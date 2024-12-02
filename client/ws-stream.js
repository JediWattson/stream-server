const actionStreamStatus = document.getPageElementById("action-stream-status");
const setDisconnected = () => {
  actionStreamStatus.status = statusStatesEnum.DISCONNECTED;
};

const setConnected = () => {
  actionStreamStatus.status = statusStatesEnum.CONNECTED;
};

let websocket;
let connected;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
async function handleSubmit(payload) {
  const { username, password } = payload;
  const headers = {
    Authorization: `Bearer ${btoa(`${username}:${password}`)}`,
  };
  const res = await fetch("/auth/login", { headers });
  if (res.status !== 204) return;

  await fetch("/subscriptions");

  websocket = new WebSocket("/ws");
  websocket.onmessage = async function (event) {
    const data = JSON.parse(event?.data);
    if (data.type === "verify-with-id") {
      const res = await fetch("/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.userId }),
      });

      if (res.status !== 204) setDisconnected();
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

const streamForm = document.getPageElementById("stream-login");
streamForm.onSubmit = handleSubmit;
