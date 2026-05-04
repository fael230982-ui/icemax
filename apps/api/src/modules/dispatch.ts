import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { dispatchAssignmentDecisionSchema, dispatchVisitPreparationSchema, fieldCompletionEmailQueueSchema, fieldCustomerSignatureRecordSchema, optimizeRouteSchema, parseBody, technicianLocationSchema } from "../schemas";
import { recordAuditEvent } from "../services/audit-service";
import { createMockDispatchArrivalCheckInPackage, createMockDispatchAssignmentDecision, createMockDispatchDepartureCommunicationPackage, createMockDispatchRouteTrackingSnapshot, createMockFieldCompletionEmailPackage, createMockFieldCustomerSignaturePackage, createMockFieldExecutionCloseoutPackage, createMockFieldExecutionEvidencePackage, createMockFieldExecutionStartPackage, createMockQuoteExecutionDispatchQueue, createMockVisitPreparationPackage, getMockServiceOrderDispatchReadiness, listMockTechnicianLocations, optimizeMockRoute, queueMockFieldCompletionEmail, recommendMockDispatchAssignments, recordMockFieldCustomerSignature, recordMockTechnicianLocation } from "../services/dispatch-service";

export async function registerDispatchRoutes(app: FastifyInstance) {
  app.get("/technicians/locations", async () => listMockTechnicianLocations());

  app.post("/technicians/:id/location", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(technicianLocationSchema, request.body);
    const location = recordMockTechnicianLocation(context.tenantId, id, input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "technician.location_reported",
      entity: "technician",
      entityId: id,
      metadata: {
        serviceOrderId: input.serviceOrderId,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });

    return reply.code(201).send(location);
  });

  app.post("/dispatch/routes/optimize", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(optimizeRouteSchema, request.body);
    const route = optimizeMockRoute(input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "dispatch.route_optimized",
      entity: "technician",
      entityId: input.technicianUserId,
      metadata: {
        totalDistanceKm: route.totalDistanceKm,
        totalTravelMinutes: route.totalTravelMinutes,
        serviceOrderIds: input.serviceOrderIds,
      },
    });

    return reply.code(201).send(route);
  });

  app.get("/dispatch/recommendations", async (request) => {
    const query = request.query as { serviceOrderIds?: string };
    const serviceOrderIds = query.serviceOrderIds
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return recommendMockDispatchAssignments({ serviceOrderIds });
  });

  app.get("/dispatch/quote-execution-queue", async () => createMockQuoteExecutionDispatchQueue());

  app.post("/dispatch/assignment-decision", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(dispatchAssignmentDecisionSchema, request.body);
    const decision = createMockDispatchAssignmentDecision(input);

    if (!decision) {
      return reply.code(404).send({ message: "Atribuicao nao encontrada para decisao do tecnico." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: decision.audit.event,
      entity: decision.audit.entity,
      entityId: decision.audit.entityId,
      metadata: {
        quoteId: input.quoteId,
        technicianUserId: input.technicianUserId,
        decision: input.decision,
        requiresManagerReview: decision.dispatchImpact.requiresManagerReview,
      },
    });

    return reply.code(201).send(decision);
  });

  app.get("/dispatch/service-orders/:id/readiness", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string };
    const readiness = getMockServiceOrderDispatchReadiness(id, query.technicianUserId);

    if (!readiness) {
      return reply.code(404).send({ message: "OS nao encontrada para prontidao de despacho." });
    }

    return readiness;
  });

  app.get("/dispatch/service-orders/:id/departure-communication", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const communication = createMockDispatchDepartureCommunicationPackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!communication) {
      return reply.code(404).send({ message: "OS nao encontrada para comunicacao de deslocamento." });
    }

    return communication;
  });

  app.get("/dispatch/service-orders/:id/route-tracking", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const tracking = createMockDispatchRouteTrackingSnapshot({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!tracking) {
      return reply.code(404).send({ message: "OS nao encontrada para acompanhamento de rota." });
    }

    return tracking;
  });

  app.get("/dispatch/service-orders/:id/arrival-checkin", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const checkIn = createMockDispatchArrivalCheckInPackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!checkIn) {
      return reply.code(404).send({ message: "OS nao encontrada para pacote de chegada." });
    }

    return checkIn;
  });

  app.get("/dispatch/service-orders/:id/execution-start", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const executionStart = createMockFieldExecutionStartPackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!executionStart) {
      return reply.code(404).send({ message: "OS nao encontrada para inicio de execucao." });
    }

    return executionStart;
  });

  app.get("/dispatch/service-orders/:id/execution-evidence", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const evidence = createMockFieldExecutionEvidencePackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!evidence) {
      return reply.code(404).send({ message: "OS nao encontrada para evidencias de execucao." });
    }

    return evidence;
  });

  app.get("/dispatch/service-orders/:id/execution-closeout", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const closeout = createMockFieldExecutionCloseoutPackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!closeout) {
      return reply.code(404).send({ message: "OS nao encontrada para fechamento de execucao." });
    }

    return closeout;
  });

  app.get("/dispatch/service-orders/:id/customer-signature", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string };
    const signature = createMockFieldCustomerSignaturePackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
    });

    if (!signature) {
      return reply.code(404).send({ message: "OS nao encontrada para assinatura do cliente." });
    }

    return signature;
  });

  app.post("/dispatch/service-orders/:id/customer-signature", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(fieldCustomerSignatureRecordSchema, request.body);
    const signature = recordMockFieldCustomerSignature(id, input);

    if (!signature) {
      return reply.code(404).send({ message: "OS nao encontrada para registrar assinatura do cliente." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: signature.audit.event,
      entity: signature.audit.entity,
      entityId: signature.audit.entityId,
      metadata: {
        technicianUserId: input.technicianUserId,
        quoteId: input.quoteId,
        emailCopyToCustomer: input.emailCopyToCustomer,
        mobileOfflineId: input.mobileOfflineId,
      },
    });

    return reply.code(201).send(signature);
  });

  app.get("/dispatch/service-orders/:id/completion-email", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string; quoteId?: string; emailCopyToCustomer?: string };
    const email = createMockFieldCompletionEmailPackage({
      serviceOrderId: id,
      technicianUserId: query.technicianUserId,
      quoteId: query.quoteId,
      emailCopyToCustomer: query.emailCopyToCustomer === undefined ? undefined : query.emailCopyToCustomer === "true",
    });

    if (!email) {
      return reply.code(404).send({ message: "OS nao encontrada para e-mail de conclusao." });
    }

    return email;
  });

  app.post("/dispatch/service-orders/:id/completion-email", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(fieldCompletionEmailQueueSchema, request.body);
    const email = queueMockFieldCompletionEmail(id, input);

    if (!email) {
      return reply.code(404).send({ message: "OS nao encontrada para enfileirar e-mail de conclusao." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: email.audit.event,
      entity: email.audit.entity,
      entityId: email.audit.entityId,
      metadata: {
        technicianUserId: input.technicianUserId,
        quoteId: input.quoteId,
        emailCopyToCustomer: input.emailCopyToCustomer,
        mobileOfflineId: input.mobileOfflineId,
      },
    });

    return reply.code(201).send(email);
  });

  app.post("/dispatch/visit-preparation", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(dispatchVisitPreparationSchema, request.body);
    const preparation = createMockVisitPreparationPackage(input);

    if (!preparation) {
      return reply.code(404).send({ message: "OS nao encontrada para preparo da visita." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "dispatch.visit_preparation_created",
      entity: "service_order",
      entityId: input.serviceOrderId,
      metadata: {
        technicianUserId: input.technicianUserId,
        status: preparation.status,
        canDispatch: preparation.dispatchDecision.canDispatch,
      },
    });

    return reply.code(201).send(preparation);
  });
}
