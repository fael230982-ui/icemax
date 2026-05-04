import type { FastifyInstance } from "fastify";
import { serviceOrders, tenant, technicianLocations } from "../mock-data";
import { customerPortalOrderSchema, parseBody } from "../schemas";
import { recordAuditEvent } from "../services/audit-service";

function buildCustomerTracking(serviceOrderId: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!order) {
    return null;
  }

  const technician = technicianLocations.find((item) => item.serviceOrderId === serviceOrderId || item.technician === order.technician);
  const statusLabels: Record<string, string> = {
    open: "Solicitacao recebida",
    scheduled: "Atendimento agendado",
    en_route: "Tecnico em deslocamento",
    in_progress: "Atendimento em andamento",
    completed: "Atendimento concluido",
    cancelled: "Atendimento cancelado",
  };
  const timeline = [
    { key: "requested", label: "Solicitacao recebida", status: "done" },
    { key: "scheduled", label: "Agenda definida", status: ["scheduled", "en_route", "in_progress", "completed"].includes(order.status) ? "done" : "pending" },
    { key: "en_route", label: "Tecnico a caminho", status: ["en_route", "in_progress", "completed"].includes(order.status) ? "done" : "pending" },
    { key: "in_progress", label: "Atendimento em execucao", status: ["in_progress", "completed"].includes(order.status) ? "done" : "pending" },
    { key: "completed", label: "Relatorio e assinatura", status: order.status === "completed" ? "done" : "pending" },
  ];

  return {
    serviceOrderId,
    tenant: {
      name: tenant.name,
      supportEmail: tenant.supportEmail,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
    },
    status: order.status,
    statusLabel: statusLabels[order.status] ?? "Atendimento em acompanhamento",
    customer: order.customer,
    equipment: order.equipment,
    issue: order.priority === "emergency" ? "Atendimento prioritario" : order.issue,
    priority: order.priority,
    eta: order.eta ?? (order.status === "in_progress" ? "tecnico no local" : "a confirmar"),
    technician: {
      name: order.technician,
      status: technician?.status ?? order.status,
      lastLocationAt: technician?.capturedAt,
      locationShared: Boolean(technician),
    },
    timeline,
    customerActions: [
      order.status === "scheduled" ? "Aguardar chegada do tecnico no horario previsto." : "Acompanhar atualizacoes do atendimento.",
      order.status === "completed" ? "Conferir relatorio tecnico enviado pela empresa." : "Manter acesso ao equipamento liberado.",
      "Em caso de duvida, responder pelo canal de atendimento informado pela empresa.",
    ],
    privacy: {
      publicLink: true,
      hidesFinancialData: true,
      hidesInternalNotes: true,
      hidesTechnicianPersonalPhone: true,
    },
    refreshSeconds: 45,
  };
}

export async function registerCustomerPortalRoutes(app: FastifyInstance) {
  app.get("/customer-portal/:tenantSlug/config", async (request) => {
    const { tenantSlug } = request.params as { tenantSlug: string };

    return {
      tenantSlug,
      companyName: tenant.name,
      supportEmail: tenant.supportEmail,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      serviceOrderOpeningEnabled: true,
      whatsappOptInEnabled: true,
    };
  });

  app.post("/customer-portal/service-orders", async (request, reply) => {
    const input = parseBody(customerPortalOrderSchema, request.body);
    const order = {
      id: `portal-os-${Date.now()}`,
      tenantId: tenant.id,
      openedBy: "customer_portal",
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      address: input.address,
      equipmentType: input.equipmentType,
      equipmentLabel: input.equipmentLabel,
      title: `Solicitacao do cliente - ${input.equipmentType}`,
      description: input.problemDescription,
      priority: input.urgency,
      status: "open",
      allowWhatsapp: input.allowWhatsapp,
      createdAt: new Date().toISOString(),
    };

    await recordAuditEvent({
      tenantId: tenant.id,
      action: "customer_portal.service_order_requested",
      entity: "service_order",
      entityId: order.id,
      metadata: {
        tenantSlug: input.tenantSlug,
        urgency: input.urgency,
        allowWhatsapp: input.allowWhatsapp,
      },
    });

    return reply.code(201).send(order);
  });

  app.get("/customer-portal/service-orders/:id/tracking", async (request, reply) => {
    const { id } = request.params as { id: string };
    const tracking = buildCustomerTracking(id);

    if (!tracking) {
      return reply.code(404).send({ message: "OS nao encontrada para acompanhamento do cliente." });
    }

    return tracking;
  });
}
