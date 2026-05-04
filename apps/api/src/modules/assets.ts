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

  app.get("/floor-plans/:id/operational-view", async (request, reply) => {
    const { id } = request.params as { id: string };
    const floorPlan = floorPlans.find((item) => item.id === id);

    if (!floorPlan) {
      return reply.code(404).send({ message: "Planta nao encontrada." });
    }

    const points = floorPlan.points.map((point, index) => {
      const label = qrLabels.find((item) => item.equipmentCode === point.equipmentCode);
      const manual = manuals.find((item) => label?.equipment.toLowerCase().includes(item.brand.toLowerCase()));
      const risk = index === 0 ? "attention" : index === 1 ? "normal" : "planned";

      return {
        ...point,
        risk,
        qrPayload: label?.qrPayload ?? `icemax://equipment/${point.equipmentCode}`,
        equipment: label?.equipment ?? point.equipmentCode,
        installLocation: label?.installLocation ?? point.label,
        manualId: manual?.id,
        lastServiceOrder: index === 0 ? "1048" : index === 1 ? "1049" : null,
        nextAction: risk === "attention" ? "Abrir OS corretiva ou revisar historico recente." : "Manter acompanhamento preventivo.",
      };
    });

    return {
      floorPlan: {
        id: floorPlan.id,
        customer: floorPlan.customer,
        name: floorPlan.name,
        equipmentCount: floorPlan.equipmentCount,
      },
      summary: {
        totalPoints: points.length,
        attention: points.filter((point) => point.risk === "attention").length,
        withQr: points.filter((point) => Boolean(point.qrPayload)).length,
        withManual: points.filter((point) => Boolean(point.manualId)).length,
      },
      layers: [
        { key: "equipment", label: "Equipamentos", enabled: true },
        { key: "qr", label: "QR Codes", enabled: true },
        { key: "service_history", label: "Historico de OS", enabled: true },
        { key: "risk", label: "Risco operacional", enabled: true },
      ],
      points,
      nextActions: [
        "Abrir detalhe do equipamento pelo ponto.",
        "Ler QR Code para confirmar equipamento em campo.",
        "Consultar historico de OS antes da visita.",
        "Gerar OS corretiva a partir do ponto em atencao.",
      ],
    };
  });

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
