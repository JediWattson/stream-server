const statuses = ["webhook_callback_verification_pending", "enabled"];
const subTypeMap = {
  "channel.follow": "New Follower Subscription",
};

module.exports = ({ secret, app }) => {
	app.get("/subscription-list", async (_, res) => {
		const handleInvalidPermissions = () =>
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
}


