const obsSocket = new OBSWebSocket();
const handleMessage = async (payload) => {
  await obsSocket?.call("SetInputSettings", {
    inputName: "new follow",
    overlay: true,
    inputSettings: {
      url: `https://stream.famtrees.net/browser-source?sourcePath=new-follower&username=${payload.data?.user_name}`,
    },
  });

  const id = await obsSocket?.call("GetSceneItemId", {
    sceneName: "Main",
    sourceName: "new follow",
  });

  await obsSocket?.call("SetSceneItemEnabled", {
    sceneName: "Main",
    sceneItemEnabled: true,
    ...id,
  });

  setTimeout(() => {
    obsSocket?.call("SetSceneItemEnabled", {
      ...id,
      sceneName: "Main",
      sceneItemEnabled: false,
    });
  }, 1000 * 7);
};

const obsForm = document.getPageElementById("obs-login");
obsForm.onSubmit = async ({ url, password }) => {
  await obsSocket.connect(url, password);
  const obsStatus = document.getPageElementById("obs-status");
  obsStatus.status = statusStatesEnum.CONNECTED;
  obsSocket.on("ConnectionClosed", () => {
    obsStatus.status = statusStatesEnum.DISCONNECTED;
  });
};
