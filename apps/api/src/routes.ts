import type { FastifyInstance } from "fastify";
import { getAuthContext } from "./auth";
import { tenant } from "./mock-data";
import { registerAccelerationSuiteRoutes } from "./modules/acceleration-suite";
import { registerAuthRoutes } from "./modules/auth";
import { registerAiRoutes } from "./modules/ai";
import { registerAssetRoutes } from "./modules/assets";
import { registerAuditRoutes } from "./modules/audit";
import { registerBusinessSuiteRoutes } from "./modules/business-suite";
import { registerContractRoutes } from "./modules/contracts";
import { registerCustomerPortalRoutes } from "./modules/customer-portal";
import { registerCustomerRoutes } from "./modules/customers";
import { registerDashboardRoutes } from "./modules/dashboard";
import { registerDispatchRoutes } from "./modules/dispatch";
import { registerEquipmentRoutes } from "./modules/equipment";
import { registerEnterpriseSuiteRoutes } from "./modules/enterprise-suite";
import { registerFileRoutes } from "./modules/files";
import { registerIntegrationRoutes } from "./modules/integrations";
import { registerOperationRoutes } from "./modules/operations";
import { registerOrderRoutes } from "./modules/orders";
import { registerPlatformRoutes } from "./modules/platform";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/tenant/current", async () => tenant);
  app.get("/auth/context", async (request) => getAuthContext(request));

  await registerAccelerationSuiteRoutes(app);
  await registerAuthRoutes(app);
  await registerAiRoutes(app);
  await registerBusinessSuiteRoutes(app);
  await registerFileRoutes(app);
  await registerDashboardRoutes(app);
  await registerDispatchRoutes(app);
  await registerEnterpriseSuiteRoutes(app);
  await registerCustomerRoutes(app);
  await registerCustomerPortalRoutes(app);
  await registerEquipmentRoutes(app);
  await registerOrderRoutes(app);
  await registerContractRoutes(app);
  await registerAssetRoutes(app);
  await registerOperationRoutes(app);
  await registerIntegrationRoutes(app);
  await registerPlatformRoutes(app);
  await registerAuditRoutes(app);
}
