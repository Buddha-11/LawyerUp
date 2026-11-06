LawBot runs on Cloud Run in project `tutorial-5151c`, region `asia-south1`.
Firebase Hosting deploys the frontend separately; its workflow does not deploy this service.

Required runtime credentials: `GROQ_API_KEY`, `PINECONE_API_KEY`. Inject them using
Cloud Run environment configuration or Secret Manager, never the Docker build context.
Optional configuration: `GROQ_MODEL` (default `openai/gpt-oss-20b`) and
`PINECONE_INDEX_NAME` (default `lawbot2`). Keep the 384-dimensional MiniLM embeddings
for the existing index. Changing the LLM does not require re-indexing documents.

Run HTTP regression tests using Python 3.10+ with Flask, Flask-Cors and python-dotenv:

```text
python -m unittest discover -s ML/CHATBOT/law/tests -v
```

Build a candidate revision from the repository root, retaining the service's existing
credentials, CPU/memory, and public access settings:

```text
gcloud run deploy lawyerup-chatbot --source ML/CHATBOT/law --project tutorial-5151c --region asia-south1 --update-env-vars GROQ_MODEL=openai/gpt-oss-20b --no-traffic --tag chatbot-fix
```

Test the candidate tag URL's `/health` and `/chat/get` before routing traffic to
the new revision. Confirm a normal response, a follow-up with request history,
an independent conversation, and a 400 JSON response for an empty message.
Then promote the tested revision using `gcloud run services update-traffic`.
The prior revision remains available for rollback.

`POST /chat/get` accepts `{"msg":"question","history":[]}`. Optional history contains
up to 24 `{sender: "user" | "bot", text: "..."}` objects from this chat only.
The API retains the escaped HTML `response` field for older clients; new clients
decode it and render plain text. No conversation is stored in process-global memory.
The legacy `/chat_history` endpoint returns an empty list. Firestore remains the
frontend's persistent chat store. Provider failures return safe JSON with CORS headers.

Production frontend builds load public service URLs from `frontend/.env.production`.
Firebase/Maps web configuration must be provided by the local `.env` or the GitHub
Actions secrets referenced by the hosting workflows. Never put backend credentials
in `VITE_*` values. Production builds validate configuration before generating assets.
