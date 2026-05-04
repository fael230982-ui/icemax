import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import {
  addMockOrderNote,
  addMockOrderPart,
  addMockOrderPhoto,
  addPrismaOrderNote,
  addPrismaOrderPart,
  addPrismaOrderPhoto,
  answerMockChecklist,
  answerPrismaChecklist,
  createMockOrder,
  createMockQuoteFromOrder,
  createPrismaOrder,
  createPrismaQuoteFromOrder,
  getMockOrder,
  getMockOrderForReport,
  getPrismaOrder,
  getPrismaOrderForReport,
  listMockOrders,
  listPrismaOrders,
  updateMockOrderStatus,
  updatePrismaOrderStatus,
} from "../repositories/orders-repository";
import { saveServiceOrderReportPdf } from "../services/report-service";
import { recordAuditEvent } from "../services/audit-service";
import { buildOrderCompletionReview, buildOrderEvidenceManifest } from "../services/order-completion-service";
import {
  addServiceOrderNoteSchema,
  addServiceOrderPartSchema,
  addServiceOrderPhotoSchema,
  answerChecklistSchema,
  createQuoteFromOrderSchema,
  createServiceOrderSchema,
  parseBody,
  updateServiceOrderStatusSchema,
} from "../schemas";

export async function registerOrderRoutes(app: FastifyInstance) {
  app.get("/service-orders", async (request) => {
    const context = await getAuthContext(request);
    const filters = request.query as { status?: string; priority?: string; customer?: string };

    if (isPrismaEnabled()) {
      return listPrismaOrders(context.tenantId, filters);
    }

    return listMockOrders(filters);
  });

  app.get("/service-orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const order = isPrismaEnabled()
      ? await getPrismaOrder(context.tenantId, id)
      : await getMockOrder(id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    return order;
  });

  app.post("/service-orders", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createServiceOrderSchema, request.body);
    const order = isPrismaEnabled()
      ? await createPrismaOrder(context.tenantId, context.userId, input)
      : await createMockOrder(context.tenantId, context.userId, input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "service_order.created",
      entity: "service_order",
      entityId: order.id,
      metadata: { title: input.title, priority: input.priority },
    });

    return reply.code(201).send(order);
  });

  app.post("/service-orders/:id/notes", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(addServiceOrderNoteSchema, request.body);
    const note = isPrismaEnabled()
      ? await addPrismaOrderNote(context.tenantId, id, context.userId, input)
      : await addMockOrderNote(context.tenantId, id, context.userId, input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "service_order.note_added",
      entity: "service_order",
      entityId: id,
      metadata: { aiReviewed: input.aiReviewed },
    });

    return reply.code(201).send(note);
  });

  app.post("/service-orders/:id/photos", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(addServiceOrderPhotoSchema, request.body);
    const photo = isPrismaEnabled()
      ? await addPrismaOrderPhoto(context.tenantId, id, context.userId, input)
      : await addMockOrderPhoto(context.tenantId, id, context.userId, input);

    return reply.code(201).send(photo);
  });

  app.post("/service-orders/:id/checklist-answers", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(answerChecklistSchema, request.body);
    const answer = isPrismaEnabled()
      ? await answerPrismaChecklist(context.tenantId, id, input)
      : await answerMockChecklist(context.tenantId, id, input);

    return reply.code(201).send(answer);
  });

  app.post("/service-orders/:id/parts", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(addServiceOrderPartSchema, request.body);
    const part = isPrismaEnabled()
      ? await addPrismaOrderPart(context.tenantId, id, input)
      : await addMockOrderPart(context.tenantId, id, input);

    return reply.code(201).send(part);
  });

  app.patch("/service-orders/:id/status", async (request) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(updateServiceOrderStatusSchema, request.body);
    const order = isPrismaEnabled()
      ? await updatePrismaOrderStatus(context.tenantId, id, input)
      : await updateMockOrderStatus(context.tenantId, id, input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "service_order.status_updated",
      entity: "service_order",
      entityId: id,
      metadata: {
        status: input.status,
        customerSignedName: input.customerSignedName,
      },
    });

    return order;
  });

  app.post("/service-orders/:id/quotes", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(createQuoteFromOrderSchema, request.body);
    const quote = isPrismaEnabled()
      ? await createPrismaQuoteFromOrder(context.tenantId, id, input)
      : await createMockQuoteFromOrder(context.tenantId, id, input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "quote.created_from_order",
      entity: "service_order",
      entityId: id,
      metadata: { quoteNumber: input.number, total: quote.total },
    });

    return reply.code(201).send(quote);
  });

  app.post("/service-orders/:id/report", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const order = isPrismaEnabled()
      ? await getPrismaOrderForReport(context.tenantId, id)
      : await getMockOrderForReport(context.tenantId, id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    const report = await saveServiceOrderReportPdf(id, {
      order: {
        id: order.id,
        title: "title" in order ? order.title : "Ordem de servico",
        description: order.description,
        status: order.status,
        customerSignedName: order.customerSignedName,
      },
      customer: order.customer,
      equipment: order.equipment,
      notes: order.notes,
      photos: order.photos,
      parts: "partsUsed" in order ? order.partsUsed : [],
    });

    return reply.code(201).send(report);
  });

  app.get("/service-orders/:id/completion-review", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const order = isPrismaEnabled()
      ? await getPrismaOrderForReport(context.tenantId, id)
      : await getMockOrderForReport(context.tenantId, id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    return buildOrderCompletionReview(order);
  });

  app.get("/service-orders/:id/evidence-manifest", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const order = isPrismaEnabled()
      ? await getPrismaOrderForReport(context.tenantId, id)
      : await getMockOrderForReport(context.tenantId, id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    return buildOrderEvidenceManifest(order);
  });
}
