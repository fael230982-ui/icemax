import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { activateMockContractFromAcceptance, activatePrismaContractFromAcceptance } from "../repositories/contracts-repository";
import {
  activateContractFromServiceOrderSchema,
  createInvoiceDraftSchema,
  createMaintenanceWindowSchema,
  createPmocPlanSchema,
  createPurchaseRequestSchema,
  createWarrantyTermSchema,
  equipmentTimelineSchema,
  onboardTechnicianSchema,
  parseBody,
  releaseReadinessSchema,
  reserveServiceOrderPartsSchema,
  satisfactionSurveySchema,
} from "../schemas";
import {
  calculateSlaBoard,
  createContractAcceptancePackageFromServiceOrder,
  createContractActivationPlanFromServiceOrder,
  createContractBillingPlan,
  createContractCommunicationPackage,
  createContractCommunicationQueue,
  createDayCommandCenter,
  createInvoiceDraft,
  createMaintenanceWindow,
  createPmocPlan,
  createServiceOrderCommunicationPackage,
  createServiceOrderCommunicationQueue,
  createContractOpportunityFromServiceOrder,
  createContractProposalFromServiceOrder,
  createPostServicePlan,
  createPurchaseRequest,
  createReleaseReadiness,
  createServiceOrderManualPackage,
  createServiceOrderPartsReservation,
  createServiceOrderWarrantyPackage,
  createWarrantyTerm,
  getEquipmentTimeline,
  onboardTechnician,
  recordSatisfactionSurvey,
  suggestPurchaseRequests,
} from "../services/business-suite-service";
import { recordAuditEvent } from "../services/audit-service";

export async function registerBusinessSuiteRoutes(app: FastifyInstance) {
  app.get("/sla/board", async () => calculateSlaBoard());

  app.get("/operations/day-command-center", async () => createDayCommandCenter());

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

  app.post("/service-orders/:id/parts-reservation", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(reserveServiceOrderPartsSchema, { ...(request.body as object), serviceOrderId: id });
    const reservation = createServiceOrderPartsReservation(input);

    if (!reservation) {
      return reply.code(404).send({ message: "OS nao encontrada para reserva de pecas." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "stock.parts_reserved_for_service_order",
      entity: "service_order",
      entityId: id,
      metadata: {
        status: reservation.status,
        reserved: reservation.summary.reserved,
        missing: reservation.summary.missing,
      },
    });

    return reply.code(201).send(reservation);
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

  app.get("/service-orders/:id/warranty-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const warrantyPackage = createServiceOrderWarrantyPackage(id);

    if (!warrantyPackage) {
      return reply.code(404).send({ message: "OS nao encontrada para pacote de garantia." });
    }

    return warrantyPackage;
  });

  app.get("/service-orders/:id/manual-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const manualPackage = createServiceOrderManualPackage(id);

    if (!manualPackage) {
      return reply.code(404).send({ message: "OS nao encontrada para pacote de manual tecnico." });
    }

    return manualPackage;
  });

  app.get("/service-orders/:id/contract-opportunity", async (request, reply) => {
    const { id } = request.params as { id: string };
    const opportunity = createContractOpportunityFromServiceOrder(id);

    if (!opportunity) {
      return reply.code(404).send({ message: "OS nao encontrada para oportunidade de contrato." });
    }

    return opportunity;
  });

  app.get("/service-orders/:id/contract-proposal", async (request, reply) => {
    const { id } = request.params as { id: string };
    const proposal = createContractProposalFromServiceOrder(id);

    if (!proposal) {
      return reply.code(404).send({ message: "OS nao encontrada para proposta de contrato." });
    }

    return proposal;
  });

  app.get("/service-orders/:id/contract-activation-plan", async (request, reply) => {
    const { id } = request.params as { id: string };
    const activationPlan = createContractActivationPlanFromServiceOrder(id);

    if (!activationPlan) {
      return reply.code(404).send({ message: "OS nao encontrada para plano de ativacao de contrato." });
    }

    return activationPlan;
  });

  app.get("/service-orders/:id/contract-acceptance-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const acceptancePackage = createContractAcceptancePackageFromServiceOrder(id);

    if (!acceptancePackage) {
      return reply.code(404).send({ message: "OS nao encontrada para pacote de aceite de contrato." });
    }

    return acceptancePackage;
  });

  app.post("/service-orders/:id/contract-acceptance/activate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(activateContractFromServiceOrderSchema, request.body);
    const acceptancePackage = createContractAcceptancePackageFromServiceOrder(id);

    if (!acceptancePackage) {
      return reply.code(404).send({ message: "OS nao encontrada para ativacao de contrato." });
    }

    const activationInput = {
      serviceOrderId: id,
      customerId: input.customerId,
      addressId: input.addressId,
      equipmentIds: input.equipmentIds,
      name: acceptancePackage.acceptanceDocument.plan,
      recurrenceMonths: acceptancePackage.acceptanceDocument.acceptanceText.includes("recorrencia de 4")
        ? 4 as const
        : acceptancePackage.acceptanceDocument.acceptanceText.includes("recorrencia de 6")
          ? 6 as const
          : 3 as const,
      startDate: new Date(`${acceptancePackage.acceptanceDocument.startDate}T00:00:00.000Z`).toISOString(),
      includesPreventive: true,
      includesCleaning: true,
      monthlyValue: acceptancePackage.acceptanceDocument.monthlyValue,
      acceptedByName: input.acceptedByName,
      acceptedByDocument: input.acceptedByDocument,
      acceptedAt: input.acceptedAt,
      firstVisitTechnicianId: input.firstVisitTechnicianId,
      firstVisitTitle: "Primeira preventiva contratual",
      firstVisitDescription: `Ativar contrato ${acceptancePackage.acceptanceDocument.plan} e executar primeira preventiva.`,
      generateVisits: input.generateVisits,
      notes: `Contrato ativado a partir da OS ${id}.`,
    };

    const result = isPrismaEnabled()
      ? await activatePrismaContractFromAcceptance(context.tenantId, context.userId, activationInput)
      : await activateMockContractFromAcceptance(context.tenantId, context.userId, activationInput);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "contract.acceptance_activated",
      entity: "service_order",
      entityId: id,
      metadata: {
        status: result.status,
        acceptedByName: input.acceptedByName,
        createdEntities: result.createdEntities,
      },
    });

    return reply.code(201).send(result);
  });

  app.get("/contracts/:id/billing-plan", async (request, reply) => {
    const { id } = request.params as { id: string };
    const billingPlan = createContractBillingPlan(id);

    if (!billingPlan) {
      return reply.code(404).send({ message: "Contrato nao encontrado para plano financeiro." });
    }

    return billingPlan;
  });

  app.get("/service-orders/:id/communication-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const communicationPackage = createServiceOrderCommunicationPackage(id);

    if (!communicationPackage) {
      return reply.code(404).send({ message: "OS nao encontrada para pacote de comunicacao." });
    }

    return communicationPackage;
  });

  app.get("/contracts/:id/communication-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const communicationPackage = createContractCommunicationPackage(id);

    if (!communicationPackage) {
      return reply.code(404).send({ message: "Contrato nao encontrado para pacote de comunicacao." });
    }

    return communicationPackage;
  });

  app.post("/service-orders/:id/communication-queue", async (request, reply) => {
    const { id } = request.params as { id: string };
    const queue = createServiceOrderCommunicationQueue(id);

    if (!queue) {
      return reply.code(404).send({ message: "OS nao encontrada para fila de comunicacao." });
    }

    return reply.code(201).send(queue);
  });

  app.post("/contracts/:id/communication-queue", async (request, reply) => {
    const { id } = request.params as { id: string };
    const queue = createContractCommunicationQueue(id);

    if (!queue) {
      return reply.code(404).send({ message: "Contrato nao encontrado para fila de comunicacao." });
    }

    return reply.code(201).send(queue);
  });
}
