import test from "node:test";
import assert from "node:assert/strict";
import { chatHistory, chatText } from "../src/components/chatProtocol.js";

test("legacy API formatting becomes text without injecting markup", () => {
  assert.equal(chatText("Hello<br><b>World</b> &amp; &#x27;you&#39;"), "Hello\nWorld & 'you'");
  assert.equal(chatText('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'), '<img src=x onerror="alert(1)">');
});

test("only completed successful turns enter the current chat history", () => {
  assert.deepEqual(chatHistory([
    { sender: "user", text: "first" }, { sender: "bot", text: "failed", isError: true },
    { sender: "user", text: "second" }, { sender: "bot", text: "ok<br>yes" },
    { sender: "user", text: "pending" },
  ]), [{ sender: "user", text: "second" }, { sender: "bot", text: "ok\nyes" }]);
});

test("history stays within backend message and turn limits", () => {
  const turns = Array.from({ length: 20 }, (_, i) => [
    { sender: "user", text: `question ${i}` }, { sender: "bot", text: "answer" },
  ]).flat();
  const history = chatHistory(turns);
  assert.equal(history.length, 24);
  assert.equal(history[0].text, "question 8");
  const longHistory = chatHistory(turns.map((message) => ({ ...message, text: "x".repeat(9000) })));
  assert.equal(longHistory.length, 2);
  assert.equal(longHistory[1].text.length, 8000);
  assert.ok(longHistory.reduce((total, message) => total + message.text.length, 0) <= 20000);
});
