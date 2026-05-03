import { createReadStream, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import type { FastifyInstance } from "fastify";
import { getStorageRoot } from "../services/storage-service";

export async function registerFileRoutes(app: FastifyInstance) {
  app.get("/files/*", async (request, reply) => {
    const params = request.params as { "*": string };
    const relativePath = normalize(params["*"]);
    const absolutePath = join(getStorageRoot(), relativePath);

    if (!absolutePath.startsWith(getStorageRoot()) || !existsSync(absolutePath)) {
      return reply.code(404).send({ message: "Arquivo nao encontrado." });
    }

    if (absolutePath.endsWith(".html")) {
      reply.type("text/html; charset=utf-8");
    }

    return reply.send(createReadStream(absolutePath));
  });
}
