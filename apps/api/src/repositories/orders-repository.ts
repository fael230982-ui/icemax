import { getPrisma } from "../database";
import { serviceOrders } from "../mock-data";
import type {
  AddServiceOrderNoteInput,
  AddServiceOrderPartInput,
  AddServiceOrderPhotoInput,
  AnswerChecklistInput,
  CreateQuoteFromOrderInput,
  CreateServiceOrderInput,
  UpdateServiceOrderStatusInput,
} from "../schemas";

export async function listMockOrders() {
  return {
    data: serviceOrders,
    total: serviceOrders.length,
  };
}

export async function getMockOrder(id: string) {
  return serviceOrders.find((item) => item.id === id) ?? null;
}

export async function listPrismaOrders(tenantId: string) {
  const prisma = getPrisma();
  const data = await prisma.serviceOrder.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: true,
      equipment: true,
      assignedTechnician: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function getPrismaOrder(tenantId: string, id: string) {
  return getPrisma().serviceOrder.findFirst({
    where: { tenantId, id },
    include: {
      customer: true,
      equipment: true,
      address: true,
      assignedTechnician: true,
      photos: true,
      notes: true,
      partsUsed: true,
      quotes: true,
    },
  });
}

export async function createMockOrder(tenantId: string, openedByUserId: string, input: CreateServiceOrderInput) {
  return {
    id: `${Date.now()}`,
    tenantId,
    openedByUserId,
    status: "open",
    ...input,
  };
}

export async function createPrismaOrder(tenantId: string, openedByUserId: string, input: CreateServiceOrderInput) {
  return getPrisma().serviceOrder.create({
    data: {
      tenantId,
      openedByUserId,
      customerId: input.customerId,
      equipmentId: input.equipmentId,
      addressId: input.addressId,
      assignedTechnicianId: input.assignedTechnicianId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: "open",
      scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : undefined,
      scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined,
    },
  });
}

export async function addMockOrderNote(tenantId: string, serviceOrderId: string, authorUserId: string, input: AddServiceOrderNoteInput) {
  return {
    id: `note-${Date.now()}`,
    tenantId,
    serviceOrderId,
    authorUserId,
    ...input,
  };
}

export async function addPrismaOrderNote(tenantId: string, serviceOrderId: string, authorUserId: string, input: AddServiceOrderNoteInput) {
  return getPrisma().serviceOrderNote.create({
    data: {
      tenantId,
      serviceOrderId,
      authorUserId,
      rawText: input.rawText,
      improvedText: input.improvedText,
      aiReviewed: input.aiReviewed,
    },
  });
}

export async function addMockOrderPhoto(tenantId: string, serviceOrderId: string, createdByUserId: string, input: AddServiceOrderPhotoInput) {
  return {
    id: `photo-${Date.now()}`,
    tenantId,
    serviceOrderId,
    createdByUserId,
    ...input,
  };
}

export async function addPrismaOrderPhoto(tenantId: string, serviceOrderId: string, createdByUserId: string, input: AddServiceOrderPhotoInput) {
  return getPrisma().serviceOrderPhoto.create({
    data: {
      tenantId,
      serviceOrderId,
      createdByUserId,
      type: input.type,
      fileUrl: input.fileUrl,
      caption: input.caption,
    },
  });
}

export async function answerMockChecklist(tenantId: string, serviceOrderId: string, input: AnswerChecklistInput) {
  return {
    id: `answer-${Date.now()}`,
    tenantId,
    serviceOrderId,
    ...input,
  };
}

export async function answerPrismaChecklist(tenantId: string, serviceOrderId: string, input: AnswerChecklistInput) {
  return getPrisma().serviceOrderChecklistAnswer.create({
    data: {
      tenantId,
      serviceOrderId,
      checklistItemId: input.checklistItemId,
      value: input.value,
    },
  });
}

export async function addMockOrderPart(tenantId: string, serviceOrderId: string, input: AddServiceOrderPartInput) {
  return {
    id: `order-part-${Date.now()}`,
    tenantId,
    serviceOrderId,
    ...input,
  };
}

export async function addPrismaOrderPart(tenantId: string, serviceOrderId: string, input: AddServiceOrderPartInput) {
  return getPrisma().serviceOrderPart.create({
    data: {
      tenantId,
      serviceOrderId,
      partId: input.partId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    },
  });
}

export async function updateMockOrderStatus(tenantId: string, serviceOrderId: string, input: UpdateServiceOrderStatusInput) {
  return {
    id: serviceOrderId,
    tenantId,
    ...input,
    completedAt: input.status === "completed" ? new Date().toISOString() : undefined,
  };
}

export async function updatePrismaOrderStatus(tenantId: string, serviceOrderId: string, input: UpdateServiceOrderStatusInput) {
  return getPrisma().serviceOrder.update({
    where: { id: serviceOrderId, tenantId },
    data: {
      status: input.status,
      customerSignedName: input.customerSignedName,
      customerSignatureUrl: input.customerSignatureUrl,
      completedAt: input.status === "completed" ? new Date() : undefined,
    },
  });
}

export async function createMockQuoteFromOrder(tenantId: string, serviceOrderId: string, input: CreateQuoteFromOrderInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return {
    id: `quote-${Date.now()}`,
    tenantId,
    serviceOrderId,
    status: "draft",
    ...input,
    subtotal,
    discount: input.discount,
    total: subtotal - input.discount,
  };
}

export async function createPrismaQuoteFromOrder(tenantId: string, serviceOrderId: string, input: CreateQuoteFromOrderInput) {
  const prisma = getPrisma();
  const order = await prisma.serviceOrder.findFirstOrThrow({
    where: { id: serviceOrderId, tenantId },
  });
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - input.discount;

  return prisma.quote.create({
    data: {
      tenantId,
      serviceOrderId,
      customerId: order.customerId,
      number: input.number,
      validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
      subtotal,
      discount: input.discount,
      total,
      items: {
        create: input.items.map((item) => ({
          tenantId,
          kind: item.kind,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          partId: item.partId,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}
