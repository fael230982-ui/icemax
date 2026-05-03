import { getPrisma } from "../database";
import { checklistTemplates, quotes, stock } from "../mock-data";
import type { CreatePartInput, CreateStockLocationInput, CreateStockMovementInput } from "../schemas";

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

export async function createMockPart(tenantId: string, input: CreatePartInput) {
  return {
    id: `part-${Date.now()}`,
    tenantId,
    active: true,
    ...input,
  };
}

export async function createPrismaPart(tenantId: string, input: CreatePartInput) {
  return getPrisma().part.create({
    data: {
      tenantId,
      sku: input.sku,
      name: input.name,
      unit: input.unit,
      costPrice: input.costPrice,
      salePrice: input.salePrice,
      minimumStock: input.minimumStock,
    },
  });
}

export async function listPrismaStockLocations(tenantId: string) {
  const data = await getPrisma().stockLocation.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });

  return {
    data,
    total: data.length,
  };
}

export async function listMockStockLocations() {
  return {
    data: [
      { id: "loc-001", name: "Almoxarifado", type: "warehouse" },
      { id: "loc-002", name: "Veiculo Rafael", type: "vehicle" },
    ],
    total: 2,
  };
}

export async function createMockStockLocation(tenantId: string, input: CreateStockLocationInput) {
  return {
    id: `location-${Date.now()}`,
    tenantId,
    active: true,
    ...input,
  };
}

export async function createPrismaStockLocation(tenantId: string, input: CreateStockLocationInput) {
  return getPrisma().stockLocation.create({
    data: {
      tenantId,
      name: input.name,
      type: input.type,
      technicianUserId: input.technicianUserId,
    },
  });
}

export async function createMockStockMovement(tenantId: string, createdByUserId: string, input: CreateStockMovementInput) {
  return {
    id: `movement-${Date.now()}`,
    tenantId,
    createdByUserId,
    ...input,
  };
}

export async function createPrismaStockMovement(tenantId: string, createdByUserId: string, input: CreateStockMovementInput) {
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({
      data: {
        tenantId,
        partId: input.partId,
        fromLocationId: input.fromLocationId,
        toLocationId: input.toLocationId,
        serviceOrderId: input.serviceOrderId,
        quantity: input.quantity,
        reason: input.reason,
        createdByUserId,
      },
    });

    if (input.fromLocationId) {
      await tx.stockItem.upsert({
        where: { partId_locationId: { partId: input.partId, locationId: input.fromLocationId } },
        create: {
          tenantId,
          partId: input.partId,
          locationId: input.fromLocationId,
          quantity: -input.quantity,
        },
        update: {
          quantity: { decrement: input.quantity },
        },
      });
    }

    if (input.toLocationId) {
      await tx.stockItem.upsert({
        where: { partId_locationId: { partId: input.partId, locationId: input.toLocationId } },
        create: {
          tenantId,
          partId: input.partId,
          locationId: input.toLocationId,
          quantity: input.quantity,
        },
        update: {
          quantity: { increment: input.quantity },
        },
      });
    }

    return movement;
  });
}
