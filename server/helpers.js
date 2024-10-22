const { spawn } = require('child_process')

const streamBackup = () => {
	const ffmpeg = spawn('ffmpeg', [
		'-i', 'stream_will_be_back.mp4',
		'-c:v', 'libx264', 
		'-preset', 'veryfast', 
		'-b:v', '6000k', 
		'-maxrate', '6000k', 
		'-bufsize', '12000k',
		'-c:a', 'aac', 
		'-b:a', '128k', 
		'-f', 'flv', 
		`rtmp://live.twitch.tv/app/${process.env.TWITCH_STREAM_KEY}`
	]);

	ffmpeg.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});
}

async function readAndParseStream(readableStream) {
  const reader = readableStream.getReader();
  const decoder = new TextDecoder(); // Create a TextDecoder
  let streamString = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    streamString += decoder.decode(value, { stream: true });
  }

  return JSON.parse(streamString);
}

const token = async () => {
  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });

  return readAndParseStream(res.body);
};

const getUserId = async ({ auth }) => {
  const headers = {
    Authorization: `Bearer ${auth.access_token}`,
    "Client-Id": process.env.CLIENT_ID,
    "Content-Type": "application/json",
  };

  const usersRes = await fetch(
    "https://api.twitch.tv/helix/users?login=jediwattzon22",
    {
      headers,
    },
  );
  const users = await readAndParseStream(usersRes.body);
  return users.data[0]?.id;
};

module.exports = {
	streamBackup,
  readAndParseStream,
	getUserId,
	token
};


