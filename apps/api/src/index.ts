import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { buildServer } from "./server.js";

const DEFAULT_PORT = 3001;
const DEFAULT_HOST = "127.0.0.1";

async function start(): Promise<void> {
  const app = buildServer();
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const host = process.env.HOST ?? DEFAULT_HOST;

  try {
    await app.listen({ port, host });
    app.log.info(`scriptforge-api listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
