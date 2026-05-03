import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";
import { serviceOrderStatuses } from "@icemax/shared";
import { registerRoutes } from "./routes";

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Dados invalidos.",
        issues: error.issues,
      });
    }

    app.log.error(error);
    return reply.code(500).send({ message: "Erro interno." });
  });

  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async () => ({
    ok: true,
    service: "icemax-api",
  }));

  app.get("/meta", async () => ({
    product: "ICEMAX Platform",
    tenantStrategy: "multi-tenant",
    statuses: serviceOrderStatuses,
  }));

  await registerRoutes(app);

  return app;
}
