import type { Server } from "node:http";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

let server: Server | undefined;

async function start(): Promise<void> {
  await connectDatabase();
  server = app.listen(env.PORT, () => {
    console.info(`API listening on http://localhost:${env.PORT}`);
  });
}

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} received; shutting down`);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch((error: unknown) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
