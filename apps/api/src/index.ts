import { buildServer } from "./server.js";
import { config } from "./config.js";

const app = await buildServer();

try {
  await app.listen({
    host: config.apiHost,
    port: config.apiPort
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
