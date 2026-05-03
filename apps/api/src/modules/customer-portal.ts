import type { FastifyInstance } from "fastify";
import { tenant } from "../mock-data";
import { customerPortalOrderSchema, parseBody } from "../schemas";
import { recordAuditEvent } from "../services/audit-service";

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
}
