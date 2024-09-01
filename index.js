require("dotenv").config();

const path = require('path');
const express = require("express");
const http = require("http");
const crypto = require("crypto");

const wss = require("./websocket");
const { readAndParseStream } = require("./helpers");
const { delSub, subEvent, token, subList, webhook } = require("./hooks");

const app = express();
const server = http.createServer(app);

app.use("/static", express.static(path.join(__dirname, '/public')));   
app.set("view engine", "ejs");

app.use(
  express.raw({
    type: "application/json",
  }),
);

app.get("/browser-source", (req, res) => {
	  const username = req.query.username;
		const sourcePath = req.query.sourcePath
		res.render(sourcePath, { username })
})

app.get("/", async (req, res) => {
  const isSuccess = await init();
  if (isSuccess)
    return res.render("index", {
      websocketUrl: process.env.WEBSOCKET_URL,
    });

  res.render("auth", {
    clientId: process.env.CLIENT_ID,
    redirectUri: process.env.CALLBACK_URL,
  });
});

const socket = wss({ server });

const init = async () => {
	const secret = crypto.randomBytes(32).toString("hex");
	const auth = await token({ secret });
  const list = await subList({ auth });
	if (list.status > 399) return false

	if (!list.data?.length) {
    const events = await subEvent({ auth, secret });
    if (events.status > 399) return false;
  }
	
	const disabledSubs = list.data?.filter(l => l.status !== "enabled")
	if (disabledSubs.length > 0) 
		await Promise.all(
						disabledSubs.map(sub => delSub({ subId: sub.id, auth }))
					)

  webhook({ socket, secret, app });
  return true;
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
