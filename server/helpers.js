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

module.exports = {
  readAndParseStream,
};
