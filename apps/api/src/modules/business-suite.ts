import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import {
  createInvoiceDraftSchema,
  createMaintenanceWindowSchema,
  createPmocPlanSchema,
  createPurchaseRequestSchema,
  createWarrantyTermSchema,
  equipmentTimelineSchema,
  onboardTechnicianSchema,
  parseBody,
  releaseReadinessSchema,
  satisfactionSurveySchema,
} from "../schemas";
import {
  calculateSlaBoard,
  createInvoiceDraft,
  createMaintenanceWindow,
  createPmocPlan,
  createContractOpportunityFromServiceOrder,
  createPostServicePlan,
  createPurchaseRequest,
  createReleaseReadiness,
  createWarrantyTerm,
  getEquipmentTimeline,
  onboardTechnician,
  recordSatisfactionSurvey,
  suggestPurchaseRequests,
} from "../services/business-suite-service";
import { recordAuditEvent } from "../services/audit-service";

export async function registerBusinessSuiteRoutes(app: FastifyInstance) {
  app.get("/sla/board", async () => calculateSlaBoard());

  app.post("/warranty-terms", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createWarrantyTermSchema, request.body);
    const term = createWarrantyTerm(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "warranty_term.created", entity: "warranty_term", entityId: term.id });
    return reply.code(201).send(term);
  });

  app.post("/pmoc/plans", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createPmocPlanSchema, request.body);
    const plan = createPmocPlan(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "pmoc_plan.created", entity: "pmoc_plan", entityId: plan.id });
    return reply.code(201).send(plan);
  });

  app.post("/billing/invoices/draft", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createInvoiceDraftSchema, request.body);
    const invoice = createInvoiceDraft(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "invoice.drafted", entity: "invoice", entityId: invoice.id });
    return reply.code(201).send(invoice);
  });

  app.post("/technicians/onboarding", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(onboardTechnicianSchema, request.body);
    const technician = onboardTechnician(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "technician.onboarded", entity: "technician", entityId: technician.id });
    return reply.code(201).send(technician);
  });

  app.post("/maintenance-windows", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createMaintenanceWindowSchema, request.body);
    const window = createMaintenanceWindow(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "maintenance_window.created", entity: "maintenance_window", entityId: window.id });
    return reply.code(201).send(window);
  });

  app.post("/satisfaction-surveys", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(satisfactionSurveySchema, request.body);
    const survey = recordSatisfactionSurvey(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "satisfaction_survey.recorded", entity: "satisfaction_survey", entityId: survey.id });
    return reply.code(201).send(survey);
  });

  app.get("/equipment/:id/timeline", async (request) => {
    const { id } = request.params as { id: string };
    const input = equipmentTimelineSchema.parse({ equipmentId: id });
    return getEquipmentTimeline(input.equipmentId);
  });

  app.get("/purchase-requests/suggestions", async () => suggestPurchaseRequests());

  app.post("/purchase-requests", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createPurchaseRequestSchema, request.body);
    const purchase = createPurchaseRequest(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "purchase_request.created", entity: "purchase_request", entityId: purchase.id });
    return reply.code(201).send(purchase);
  });

  app.post("/release-readiness", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(releaseReadinessSchema, request.body);
    const readiness = createReleaseReadiness(input);
    await recordAuditEvent({ tenantId: context.tenantId, userId: context.userId, action: "release_readiness.created", entity: "release_readiness", entityId: readiness.id });
    return reply.code(201).send(readiness);
  });

  app.get("/service-orders/:id/post-service-plan", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = createPostServicePlan(id);

    if (!plan) {
      return reply.code(404).send({ message: "OS nao encontrada para plano de pos-atendimento." });
    }

    return plan;
  });

  app.get("/service-orders/:id/contract-opportunity", async (request, reply) => {
    const { id } = request.params as { id: string };
    const opportunity = createContractOpportunityFromServiceOrder(id);

    if (!opportunity) {
      return reply.code(404).send({ message: "OS nao encontrada para oportunidade de contrato." });
    }

    return opportunity;
  });
}
