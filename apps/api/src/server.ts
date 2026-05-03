import cors from "@fastify/cors";
import Fastify from "fastify";
import { serviceOrderStatuses } from "@icemax/shared";
import { config } from "./config";
import { registerRoutes } from "./routes";

const app = Fastify({ logger: true });

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

await app.listen({ port: config.port, host: config.host });
