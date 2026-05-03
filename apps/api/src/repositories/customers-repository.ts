import { getPrisma } from "../database";
import { customers } from "../mock-data";
import type { CreateCustomerInput } from "../schemas";

export async function listMockCustomers() {
  return {
    data: customers,
    total: customers.length,
  };
}

export async function listPrismaCustomers(tenantId: string) {
  const data = await getPrisma().customer.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
    include: {
      addresses: true,
      equipment: true,
      contracts: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function createMockCustomer(tenantId: string, input: CreateCustomerInput) {
  return {
    id: `customer-${Date.now()}`,
    tenantId,
    ...input,
  };
}

export async function createPrismaCustomer(tenantId: string, input: CreateCustomerInput) {
  return getPrisma().customer.create({
    data: {
      tenantId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      document: input.document,
      notes: input.notes,
    },
  });
}
