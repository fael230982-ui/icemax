import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { floorPlans, manuals, qrLabels } from "../mock-data";
import { createQrLabelSchema, parseBody } from "../schemas";
import { recordAuditEvent } from "../services/audit-service";
import { saveQrLabelSvg } from "../services/qr-service";

export async function registerAssetRoutes(app: FastifyInstance) {
  app.get("/floor-plans", async () => ({
    data: floorPlans,
    total: floorPlans.length,
  }));

  app.get("/qr-labels", async () => ({
    data: qrLabels,
    total: qrLabels.length,
  }));

  app.post("/qr-labels", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createQrLabelSchema, request.body);
    const label = {
      id: `qr-${Date.now()}`,
      tenantId: context.tenantId,
      qrPayload: input.qrPayload ?? `icemax://equipment/${input.equipmentCode}`,
      ...input,
    };
    const file = await saveQrLabelSvg(label);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "qr_label.created",
      entity: "qr_label",
      entityId: label.id,
      metadata: {
        equipmentCode: label.equipmentCode,
        fileUrl: file.url,
      },
    });

    return reply.code(201).send({ ...label, fileUrl: file.url });
  });

  app.get("/qr-labels/:id/print", async (request, reply) => {
    const { id } = request.params as { id: string };
    const label = qrLabels.find((item) => item.id === id);

    if (!label) {
      return reply.code(404).send({ message: "Etiqueta nao encontrada." });
    }

    const file = await saveQrLabelSvg(label);
    return reply.send({ ...label, fileUrl: file.url });
  });

  app.get("/manuals", async () => ({
    data: manuals,
    total: manuals.length,
  }));
}
