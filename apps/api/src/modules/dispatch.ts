import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { dispatchVisitPreparationSchema, optimizeRouteSchema, parseBody, technicianLocationSchema } from "../schemas";
import { recordAuditEvent } from "../services/audit-service";
import { createMockQuoteExecutionDispatchQueue, createMockVisitPreparationPackage, getMockServiceOrderDispatchReadiness, listMockTechnicianLocations, optimizeMockRoute, recommendMockDispatchAssignments, recordMockTechnicianLocation } from "../services/dispatch-service";

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

  app.get("/dispatch/service-orders/:id/readiness", async (request, reply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { technicianUserId?: string };
    const readiness = getMockServiceOrderDispatchReadiness(id, query.technicianUserId);

    if (!readiness) {
      return reply.code(404).send({ message: "OS nao encontrada para prontidao de despacho." });
    }

    return readiness;
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
