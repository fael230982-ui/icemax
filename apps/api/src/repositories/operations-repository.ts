import { getPrisma } from "../database";
import { checklistTemplates, quotes, stock } from "../mock-data";

export async function listMockQuotes() {
  return {
    data: quotes,
    total: quotes.length,
  };
}

export async function listPrismaQuotes(tenantId: string) {
  const data = await getPrisma().quote.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function listMockChecklists() {
  return {
    data: checklistTemplates,
    total: checklistTemplates.length,
  };
}

export async function listPrismaChecklists(tenantId: string) {
  const data = await getPrisma().checklistTemplate.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function listMockStock() {
  return {
    data: stock,
    total: stock.length,
    alerts: stock.filter((item) => item.quantity <= item.minimum),
  };
}

export async function listPrismaStock(tenantId: string) {
  const data = await getPrisma().stockItem.findMany({
    where: { tenantId },
    include: {
      part: true,
      location: true,
    },
    orderBy: {
      part: {
        name: "asc",
      },
    },
  });

  const alerts = data.filter((item) => Number(item.quantity) <= Number(item.part.minimumStock));

  return {
    data,
    total: data.length,
    alerts,
  };
}
