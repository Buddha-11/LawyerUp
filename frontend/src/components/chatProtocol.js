// Decode the old API's escaped HTML as text; React handles safe rendering.
export function chatText(value) {
  const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/?(?:b|strong)>/gi, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
      if (entity[0] !== "#") return entities[entity.toLowerCase()] ?? match;
      const code = entity[1].toLowerCase() === "x"
        ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    });
}

export function chatHistory(messages) {
  const history = [];
  let question;
  for (const message of messages) {
    if (message.sender === "user") question = message.text;
    else if (message.sender === "bot" && question !== undefined) {
      if (!message.isError) {
        history.push({ sender: "user", text: String(question).slice(0, 8000) });
        history.push({ sender: "bot", text: chatText(message.text).slice(0, 8000) });
      }
      question = undefined;
    }
  }
  // Leave room for the current message within the API's UTF-8 body limit.
  const recent = history.slice(-24);
  while (recent.reduce((total, message) => total + message.text.length, 0) > 20000) {
    recent.splice(0, 2);
  }
  return recent;
}
