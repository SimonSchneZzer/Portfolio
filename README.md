# Talk to Simon

Portfolio chatbot for Simon Schnetzer. The stack is intentionally lean:

- `apps/web`: Next.js frontend
- `apps/api`: Fastify backend with guardrails, retrieval, and Ollama streaming
- `knowledge/public`: approved Markdown knowledge base
- `knowledge/system-prompt.md`: Simon's portfolio-facing system prompt
- `data/kb-index.json`: generated retrieval index

## Current architecture

- Frontend and backend are deployed separately.
- The backend talks to Ollama on the homeserver.
- Retrieval in v1 is keyword and heuristic based.
- The UI shows lightweight source context derived from the retrieved KB sections.
- Sensitive or non-public content is filtered conservatively before it reaches the model.

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create env files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.local.example apps/web/.env.local
   ```

3. Build the knowledge base index:

   ```bash
   pnpm kb:build
   ```

4. Start the backend and frontend in separate terminals:

   ```bash
   pnpm dev:api
   pnpm dev:web
   ```

## Notes

- Dev Ollama target is `http://192.168.8.50:11434`.
- Default chat model is `qwen2.5:3b`.
- The copied public KB and the generated index both exclude the `Date of birth` line to keep the chatbot aligned with the agreed scope.
- For production, see `ops/docker/`.
