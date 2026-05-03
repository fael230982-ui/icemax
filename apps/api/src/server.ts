import cors from "@fastify/cors";
import Fastify from "fastify";
import { serviceOrderStatuses } from "@icemax/shared";
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

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
