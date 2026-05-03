import { getPrisma } from "../database";
import { dashboardMetrics, serviceContracts, serviceOrders, tenant } from "../mock-data";

export async function getMockDashboard() {
  return {
    tenant,
    metrics: dashboardMetrics,
    urgentOrders: serviceOrders.filter((order) => order.priority === "emergency"),
    upcomingContractVisits: serviceContracts.filter((contract) => contract.status !== "scheduled"),
  };
}

export async function getPrismaDashboard(tenantId: string) {
  const prisma = getPrisma();
  const [tenantRecord, openOrders, completedToday, activeContracts, stockAlerts, urgentOrders, upcomingContractVisits] =
    await Promise.all([
      prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } }),
      prisma.serviceOrder.count({ where: { tenantId, status: { notIn: ["completed", "cancelled"] } } }),
      prisma.serviceOrder.count({
        where: {
          tenantId,
          status: "completed",
          completedAt: {
            gte: new Date(new Date().toISOString().slice(0, 10)),
          },
        },
      }),
      prisma.serviceContract.count({ where: { tenantId, active: true } }),
      prisma.stockItem.count({
        where: {
          tenantId,
          quantity: {
            lte: 5,
          },
        },
      }),
      prisma.serviceOrder.findMany({
        where: { tenantId, priority: "emergency", status: { notIn: ["completed", "cancelled"] } },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceContractVisit.findMany({
        where: {
          tenantId,
          status: { in: ["planned", "scheduled", "overdue"] },
        },
        take: 10,
        orderBy: { expectedDate: "asc" },
      }),
    ]);

  return {
    tenant: {
      id: tenantRecord.id,
      name: tenantRecord.name,
      supportEmail: tenantRecord.supportEmail,
      primaryColor: tenantRecord.primaryColor,
      secondaryColor: tenantRecord.secondaryColor,
    },
    metrics: [
      { key: "open_orders", label: "OS abertas", value: openOrders, detail: "Em aberto ou andamento" },
      { key: "completed_today", label: "Concluidas hoje", value: completedToday, detail: "Finalizadas na data atual" },
      { key: "active_contracts", label: "Contratos ativos", value: activeContracts, detail: "Clientes recorrentes" },
      { key: "stock_alerts", label: "Pecas em alerta", value: stockAlerts, detail: "Itens com baixo saldo" },
    ],
    urgentOrders,
    upcomingContractVisits,
  };
}
