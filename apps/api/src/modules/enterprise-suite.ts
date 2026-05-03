import type { FastifyInstance, FastifyRequest } from "fastify";
import { getAuthContext } from "../auth";
import {
  backupPlanSchema,
  communicationPreviewSchema,
  contractRenewalSchema,
  kmReimbursementSchema,
  lgpdRequestSchema,
  namedRecordSchema,
  parseBody,
  technicianPayableSchema,
} from "../schemas";
import { recordAuditEvent } from "../services/audit-service";
import {
  createBackupPlan,
  createContractRenewal,
  createIncidentPlaybook,
  createKmReimbursement,
  createLgpdRequest,
  createManualImportJob,
  createPermissionPolicy,
  createPriceBook,
  createSecurityIncident,
  createServiceCatalogItem,
  createTechnicianPayable,
  createTrainingChecklist,
  createWhitelabelBrand,
  getAssetDepreciation,
  getCustomerHealth,
  getExecutiveKpis,
  previewCommunication,
  previewMapGeocode,
} from "../services/enterprise-suite-service";

async function audit(request: FastifyRequest, action: string, entity: string, entityId: string) {
  const context = await getAuthContext(request);
  await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action, entity, entityId });
}

export async function registerEnterpriseSuiteRoutes(app: FastifyInstance) {
  app.post("/whitelabel/brands", async (request, reply) => {
    const result = createWhitelabelBrand(parseBody(namedRecordSchema, request.body));
    await audit(request, "whitelabel_brand.created", "whitelabel_brand", result.id);
    return reply.code(201).send(result);
  });

  app.post("/permissions/policies", async (request, reply) => {
    const result = createPermissionPolicy(parseBody(namedRecordSchema, request.body));
    await audit(request, "permission_policy.created", "permission_policy", result.id);
    return reply.code(201).send(result);
  });

  app.post("/security/incidents", async (request, reply) => {
    const result = createSecurityIncident(parseBody(namedRecordSchema, request.body));
    await audit(request, "security_incident.created", "security_incident", result.id);
    return reply.code(201).send(result);
  });

  app.post("/lgpd/requests", async (request, reply) => {
    const result = createLgpdRequest(parseBody(lgpdRequestSchema, request.body));
    await audit(request, "lgpd_request.created", "lgpd_request", result.id);
    return reply.code(201).send(result);
  });

  app.post("/maps/geocode-preview", async (request, reply) => {
    const result = previewMapGeocode(parseBody(namedRecordSchema, request.body));
    return reply.code(201).send(result);
  });

  app.post("/communications/preview", async (request, reply) => {
    const result = previewCommunication(parseBody(communicationPreviewSchema, request.body));
    await audit(request, "communication.previewed", "communication", result.id);
    return reply.code(201).send(result);
  });

  app.post("/service-catalog/items", async (request, reply) => {
    const result = createServiceCatalogItem(parseBody(namedRecordSchema, request.body));
    await audit(request, "service_catalog_item.created", "service_catalog_item", result.id);
    return reply.code(201).send(result);
  });

  app.post("/price-books", async (request, reply) => {
    const result = createPriceBook(parseBody(namedRecordSchema, request.body));
    await audit(request, "price_book.created", "price_book", result.id);
    return reply.code(201).send(result);
  });

  app.get("/kpis/executive", async () => getExecutiveKpis());

  app.post("/km-reimbursements", async (request, reply) => {
    const result = createKmReimbursement(parseBody(kmReimbursementSchema, request.body));
    await audit(request, "km_reimbursement.created", "km_reimbursement", result.id);
    return reply.code(201).send(result);
  });

  app.post("/technician-payables", async (request, reply) => {
    const result = createTechnicianPayable(parseBody(technicianPayableSchema, request.body));
    await audit(request, "technician_payable.created", "technician_payable", result.id);
    return reply.code(201).send(result);
  });

  app.post("/contract-renewals", async (request, reply) => {
    const result = createContractRenewal(parseBody(contractRenewalSchema, request.body));
    await audit(request, "contract_renewal.created", "contract_renewal", result.id);
    return reply.code(201).send(result);
  });

  app.get("/customers/:id/health", async (request) => {
    const { id } = request.params as { id: string };
    return getCustomerHealth(id);
  });

  app.get("/equipment/:id/depreciation", async (request) => {
    const { id } = request.params as { id: string };
    return getAssetDepreciation(id);
  });

  app.post("/training/checklists", async (request, reply) => {
    const result = createTrainingChecklist(parseBody(namedRecordSchema, request.body));
    await audit(request, "training_checklist.created", "training_checklist", result.id);
    return reply.code(201).send(result);
  });

  app.post("/manuals/import-jobs", async (request, reply) => {
    const result = createManualImportJob(parseBody(namedRecordSchema, request.body));
    await audit(request, "manual_import_job.created", "manual_import_job", result.id);
    return reply.code(201).send(result);
  });

  app.post("/backup-plans", async (request, reply) => {
    const result = createBackupPlan(parseBody(backupPlanSchema, request.body));
    await audit(request, "backup_plan.created", "backup_plan", result.id);
    return reply.code(201).send(result);
  });

  app.post("/incident-playbooks", async (request, reply) => {
    const result = createIncidentPlaybook(parseBody(namedRecordSchema, request.body));
    await audit(request, "incident_playbook.created", "incident_playbook", result.id);
    return reply.code(201).send(result);
  });
}
