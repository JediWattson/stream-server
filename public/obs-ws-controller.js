const wsServerStatus = document.getElementById("ws-server-status");
window.handleMessage = async (payload) => {
  await window.obsSocket?.call("SetInputSettings", {
    inputName: "new follow",
    overlay: true,
    inputSettings: {
      url: `https://stream.famtrees.net/browser-source?sourcePath=sources/new-follower&username=${payload.data?.user_name}`,
    },
  });

  const id = await window.obsSocket?.call("GetSceneItemId", {
    sceneName: "Main",
    sourceName: "new follow",
  });

  await window.obsSocket?.call("SetSceneItemEnabled", {
    sceneName: "Main",
    sceneItemEnabled: true,
    ...id,
  });

  setTimeout(() => {
    window.obsSocket?.call("SetSceneItemEnabled", {
      ...id,
      sceneName: "Main",
      sceneItemEnabled: false,
    });
  }, 1000 * 7);
};

const setDisconnected = () => {
  wsServerStatus.textContent = "WebSocket Server: Reconnecting";
  wsServerStatus.classList.remove("connected");
  wsServerStatus.classList.add("disconnected");
};

const setConnected = () => {
  wsServerStatus.textContent = "WebSocket Server: Connected";
  wsServerStatus.classList.remove("disconnected");
  wsServerStatus.classList.add("connected");
};

window.obsSocket = new OBSWebSocket();
const connectButton = document.getElementById("connectButton");

connectButton.addEventListener("click", async () => {
 	const obsUrl = document.getElementById("obsUrl").value;
	const password = document.getElementById("password").value;
  await window.obsSocket.connect(obsUrl, password);
  
	const obsStatus = document.getElementById("obs-status");
  obsStatus.textContent = "OBS: Connected";
  obsStatus.classList.remove("disconnected");
  obsStatus.classList.add("connected");

  window.obsSocket.on("ConnectionClosed", () => {
    obsStatus.textContent = "OBS: Disconnected";
    obsStatus.classList.add("disconnected");
    obsStatus.classList.remove("connected");
  });
});
