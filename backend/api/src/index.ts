import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { env } from "./env.js";

const app = await createApp();
export default app;
// Imports never start a listener; Vercel consumes the exported Fastify instance.
if (
  process.env.VERCEL !== "1" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}
