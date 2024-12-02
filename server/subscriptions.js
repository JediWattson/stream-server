const { readAndParseStream, getUserId, token } = require("./helpers");

const makeHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Client-Id": process.env.CLIENT_ID,
  "Content-Type": "application/json",
});

const statuses = ["webhook_callback_verification_pending", "enabled"];
const subTypeMap = {
  "channel.follow": "New Follower Subscription",
};

module.exports = ({ verify, secret, app, sockets }) => {
  app.get("/subscriptions", verify, async (_, res) => {
    const handleInvalidPermissions = (status) =>
      res
        .status(status !== 403 ? 400 : status)
        .send({ reason: "lacking permissions for auth" });

    const auth = await token({ secret });
    const userId = await getUserId({ auth });
    const list = await subList({ auth, userId });
    if (list.status > 399) return handleInvalidPermissions(list.status);

    const {
      stream,
      disabled = [],
      available = [],
    } = list.data.reduce((acc, sub) => {
      const isAvailable = statuses.includes(sub.status);
      if (sub.type === "stream.online" && isAvailable)
        return { ...acc, stream: sub };

      const key = isAvailable ? "available" : "disabled";
      if (!acc[key]) acc[key] = [];
      acc[key].push(sub);
      return acc;
    }, {});

    if (disabled.length > 0)
      await Promise.all(disabled.map((sub) => delSub({ auth, subId: sub.id })));

    if (!available.length) {
      const events = await subEvent({
        eventType: "channel.follow",
        version: 2,
        auth,
        userId,
      });
      if (events.status > 399) return handleInvalidPermissions(events.status);

      available.push(...events);
    }

    res.send(
      available.map((s) => ({
        status: s.status,
        type: s.type,
        label: subTypeMap[s.type],
      })),
    );

    if (!stream) {
      const streamSub = await subEvent({
        eventType: "stream.online",
        version: 1,
        auth,
        userId,
      });

      if (events.status > 399)
        return handleInvalidPermissions(streamSub.status);
    }

    const onlineStatus = await checkOnlineStatus({ userId, auth });
    if (onlineStatus.data.length === 1) sockets[userId].isOnline = true;
  });

  const subList = async ({ userId, auth }) => {
    const response = await fetch(
      `https://api.twitch.tv/helix/eventsub/subscriptions?user_id=${userId}`,
      { headers: makeHeaders(auth.access_token) },
    );

    return readAndParseStream(response.body);
  };

  const delSub = async ({ auth, subId }) => {
    const response = await fetch(
      `https://api.twitch.tv/helix/eventsub/subscriptions?id=${subId}`,
      {
        method: "delete",
        headers: makeHeaders(auth.access_token),
      },
    );

    if (response.status !== 204) throw Error("sub didn't delete :(");
  };

  const subEvent = async ({ eventType, version, userId, auth }) => {
    const res = await fetch(
      "https://api.twitch.tv/helix/eventsub/subscriptions",
      {
        method: "POST",
        headers: makeHeaders(auth.access_token),
        body: JSON.stringify({
          type: eventType,
          version,
          condition: {
            broadCaster_user_id: userId,
            moderator_user_id: userId,
          },
          transport: {
            method: "webhook",
            callback: `${process.env.CALLBACK_URL}/webhook`,
            secret,
          },
        }),
      },
    );

    return readAndParseStream(res.body);
  };

  const checkOnlineStatus = async ({ userId, auth }) => {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${userId}&type=live`,
      { headers: makeHeaders(auth.access_token) },
    );

    return readAndParseStream(response.body);
  };
};
