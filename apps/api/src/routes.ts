import type { FastifyInstance } from "fastify";
import { getAuthContext } from "./auth";
import { tenant } from "./mock-data";
import { registerAuthRoutes } from "./modules/auth";
import { registerAssetRoutes } from "./modules/assets";
import { registerAuditRoutes } from "./modules/audit";
import { registerContractRoutes } from "./modules/contracts";
import { registerCustomerRoutes } from "./modules/customers";
import { registerDashboardRoutes } from "./modules/dashboard";
import { registerDispatchRoutes } from "./modules/dispatch";
import { registerEquipmentRoutes } from "./modules/equipment";
import { registerFileRoutes } from "./modules/files";
import { registerIntegrationRoutes } from "./modules/integrations";
import { registerOperationRoutes } from "./modules/operations";
import { registerOrderRoutes } from "./modules/orders";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/tenant/current", async () => tenant);
  app.get("/auth/context", async (request) => getAuthContext(request));

  await registerAuthRoutes(app);
  await registerFileRoutes(app);
  await registerDashboardRoutes(app);
  await registerDispatchRoutes(app);
  await registerCustomerRoutes(app);
  await registerEquipmentRoutes(app);
  await registerOrderRoutes(app);
  await registerContractRoutes(app);
  await registerAssetRoutes(app);
  await registerOperationRoutes(app);
  await registerIntegrationRoutes(app);
  await registerAuditRoutes(app);
}
