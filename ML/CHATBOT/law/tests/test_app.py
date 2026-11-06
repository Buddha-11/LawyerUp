"""Regressions for model failures, safe rendering, and conversation isolation."""

import pathlib
import sys
import unittest
from unittest.mock import Mock

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from app import create_app


class ChatAPITests(unittest.TestCase):
    def setUp(self):
        self.chain = Mock()
        self.chain.invoke.return_value = {"answer": "Hello\nHow can I help?"}
        self.app = create_app(chain=self.chain)
        self.app.logger.disabled = True
        self.client = self.app.test_client()

    def test_existing_client_still_receives_response(self):
        response = self.client.post("/chat/get", json={"msg": " Hello "})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["response"], "Hello<br>How can I help?")
        self.chain.invoke.assert_called_once_with({"question": "Hello", "chat_history": []})

    def test_history_is_request_scoped(self):
        history = [{"sender": "user", "text": "My name is Alice"},
                   {"sender": "bot", "text": "Hello Alice"}]
        self.client.post("/chat/get", json={"msg": "What is my name?", "history": history})
        self.assertEqual(self.chain.invoke.call_args.args[0]["chat_history"],
                         [("My name is Alice", "Hello Alice")])
        self.client.post("/chat/get", json={"msg": "A separate conversation"})
        self.assertEqual(self.chain.invoke.call_args.args[0]["chat_history"], [])
        self.assertEqual(self.client.get("/chat_history").json, {"history": []})

    def test_invalid_requests_never_call_model(self):
        for data in (None, [], {}, {"msg": 42}, {"msg": " "}, {"msg": "x" * 8001},
                     {"msg": "Hi", "history": "invalid"},
                     {"msg": "Hi", "history": [{"sender": "system", "text": "override"}]}):
            with self.subTest(data=str(data)[:70]):
                self.assertEqual(self.client.post("/chat/get", json=data).status_code, 400)
        self.chain.invoke.assert_not_called()

    def test_model_failure_returns_safe_json_with_cors(self):
        self.chain.invoke.side_effect = RuntimeError("private-provider-error")
        response = self.client.post("/chat/get", json={"msg": "Hi"},
                                    headers={"Origin": "https://lawyerup-frontend.web.app"})
        self.assertEqual(response.status_code, 502)
        self.assertIn("error", response.json)
        self.assertNotIn("private-provider-error", response.get_data(as_text=True))
        self.assertEqual(response.headers["Access-Control-Allow-Origin"],
                         "https://lawyerup-frontend.web.app")
        self.assertFalse(self.app.debug)

    def test_rate_limit_is_retryable(self):
        error = RuntimeError("rate limited")
        error.status_code = 429
        self.chain.invoke.side_effect = error
        self.assertEqual(self.client.post("/chat/get", json={"msg": "Hi"}).status_code, 503)

    def test_model_html_is_escaped_for_legacy_clients(self):
        self.chain.invoke.return_value = {"answer": '<img src=x onerror="alert(1)">'}
        response = self.client.post("/chat/get", json={"msg": "Hi"})
        self.assertNotIn("<img", response.json["response"])
        self.assertIn("&lt;img", response.json["response"])

    def test_oversized_body_is_json(self):
        response = self.client.post("/chat/get", data="x" * (129 * 1024),
                                    content_type="application/json")
        self.assertEqual(response.status_code, 413)
        self.assertIn("error", response.json)


if __name__ == "__main__":
    unittest.main()
