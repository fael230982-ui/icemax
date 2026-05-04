import { createReadStream, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { parseBody, uploadFileSchema } from "../schemas";
import { recordAuditEvent } from "../services/audit-service";
import { getStorageReadiness, getStorageRoot, saveLocalFile } from "../services/storage-service";

export async function registerFileRoutes(app: FastifyInstance) {
  app.get("/files/storage-readiness", async () => getStorageReadiness());

  app.post("/files", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(uploadFileSchema, request.body);
    const stored = await saveLocalFile({
      folder: input.folder,
      fileName: input.fileName,
      content: Buffer.from(input.base64, "base64"),
    });

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "file.uploaded",
      entity: "file",
      entityId: stored.url,
      metadata: {
        fileName: input.fileName,
        folder: input.folder,
        mimeType: input.mimeType,
      },
    });

    return reply.code(201).send({ ...stored, mimeType: input.mimeType });
  });

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

    if (absolutePath.endsWith(".svg")) {
      reply.type("image/svg+xml; charset=utf-8");
    }

    return reply.send(createReadStream(absolutePath));
  });
}
