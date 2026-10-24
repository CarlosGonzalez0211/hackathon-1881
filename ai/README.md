# Internal AI integrations

`@athena/ai` is a server-only workspace library used by Fastify, not an independently deployed service. Gemini is initialized lazily from a server-provided key. The inherited generic prompt endpoint remains a developer demo. Curriculum grounding, content ingestion, embeddings and tutor policies are pending in `rag/`. Never import this package from the browser.
