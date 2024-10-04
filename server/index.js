require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const crypto = require("crypto");

const wss = require("./websocket");
const subscriptions = require("./subscriptions")
const { webhook, delSub, subEvent, token, subList } = require("./hooks");

const app = express();
const server = http.createServer(app);
const secret = crypto.randomBytes(32).toString("hex");
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.raw({ type: "application/json" }));

app.use("/static", express.static(path.join(__dirname, "..", "client")));
app.set('views', "./client/pages")
app.set("view engine", "ejs");

const sockets = wss({ server, app, secret });
webhook({ sockets, app, secret });
subscriptions({ app, secret })

const obsLoginFields = [
	{ 
		type: 'text', 
		id: 'url',
		label: 'OBS Url'
	}, { 
		type: 'text', 
		id: 'password',
		label: 'Password',
		options: { type: 'password' } 
	}
]

const streamLoginFields = [
	{ type: "text", id: "token", label: "Token" }
]

app.get("/", async (_, res) => {
	res.render(
		"index", 
		{
			streamLoginFields: JSON.stringify(streamLoginFields),
			obsLoginFields: JSON.stringify(obsLoginFields) 
		}
	)
});

app.get("/browser-source", (req, res) => {
  res.render(`sources/${req.query.sourcePath}`);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
