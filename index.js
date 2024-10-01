require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const crypto = require("crypto");

const wss = require("./websocket");
const { readAndParseStream } = require("./helpers");
const { webhook, delSub, subEvent, token, subList } = require("./hooks");

const app = express();
const server = http.createServer(app);
const secret = crypto.randomBytes(32).toString("hex");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: "application/json" }));
app.use("/static", express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");

const sockets = wss({ server, app, secret });
webhook({ sockets, app, secret });

app.get("/browser-source", (req, res) => {
  const username = req.query.username;
  const sourcePath = req.query.sourcePath;
  res.render(sourcePath, { username });
});

const subTypeMap = {
  "channel.follow": "New Follower Subscription",
};

const statuses = ["webhook_callback_verification_pending", "enabled"];
app.get("/subscription-list", async (req, res) => {
  const handleInvalidPermissions = (status) =>
    res
      .status(list.status !== 403 ? 400 : list.status)
      .send({ reason: "lack permissions for auth" });

  const auth = await token({ secret });
  const list = await subList({ auth });
  if (list.status > 399) return handleInvalidPermissions(list.status);

  const disabledSubs = list.data?.filter((l) => !statuses.includes(l.status));
  if (disabledSubs.length > 0)
    await Promise.all(
      disabledSubs.map((sub) => delSub({ subId: sub.id, auth })),
    );

  const availableSubs = list.data?.filter((l) => statuses.includes(l.status));
  if (!availableSubs.length) {
    const events = await subEvent({ auth, secret });
    availabledSubs.push(...events);
    if (events.status > 399) return handleInvalidPermisions(event.status);
  }

  return res.send(
    availableSubs.map((s) => ({
      status: s.status,
      type: s.type,
      label: subTypeMap[s.type],
    })),
  );
});

app.get("/", async (req, res) => res.render("index"));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
