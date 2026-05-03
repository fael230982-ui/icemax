import { getPrisma } from "../database";
import { equipment } from "../mock-data";
import type { CreateEquipmentInput } from "../schemas";

export async function listMockEquipment() {
  return {
    data: equipment,
    total: equipment.length,
  };
}

export async function listPrismaEquipment(tenantId: string) {
  const data = await getPrisma().equipment.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      address: true,
      qrLabels: true,
      mapPoints: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function createMockEquipment(tenantId: string, input: CreateEquipmentInput) {
  return {
    id: `equipment-${Date.now()}`,
    tenantId,
    ...input,
  };
}

export async function createPrismaEquipment(tenantId: string, input: CreateEquipmentInput) {
  return getPrisma().equipment.create({
    data: {
      tenantId,
      customerId: input.customerId,
      addressId: input.addressId,
      type: input.type,
      brand: input.brand,
      model: input.model,
      serialNumber: input.serialNumber,
      capacityBtu: input.capacityBtu,
      installationLocation: input.installationLocation,
      notes: input.notes,
    },
  });
}
