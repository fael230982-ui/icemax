import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  document: z.string().optional(),
  notes: z.string().optional(),
});

export const createEquipmentSchema = z.object({
  customerId: z.string().min(1),
  addressId: z.string().optional(),
  type: z.string().min(2),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  capacityBtu: z.number().int().positive().optional(),
  installationLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const createServiceOrderSchema = z.object({
  customerId: z.string().min(1),
  equipmentId: z.string().optional(),
  addressId: z.string().optional(),
  assignedTechnicianId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "emergency"]).default("normal"),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
});

export const createContractSchema = z.object({
  customerId: z.string().min(1),
  addressId: z.string().optional(),
  name: z.string().min(3),
  recurrenceMonths: z.union([z.literal(3), z.literal(4), z.literal(6)]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  includesPreventive: z.boolean().default(true),
  includesCleaning: z.boolean().default(true),
  equipmentIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const addServiceOrderNoteSchema = z.object({
  rawText: z.string().min(1),
  improvedText: z.string().optional(),
  aiReviewed: z.boolean().default(false),
});

export const addServiceOrderPhotoSchema = z.object({
  type: z.enum(["before", "during", "after", "issue", "part"]),
  fileUrl: z.string().url(),
  caption: z.string().optional(),
});

export const answerChecklistSchema = z.object({
  checklistItemId: z.string().min(1),
  value: z.string().optional(),
});

export const addServiceOrderPartSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative().optional(),
});

export const updateServiceOrderStatusSchema = z.object({
  status: z.enum(["draft", "open", "scheduled", "en_route", "in_progress", "waiting_approval", "completed", "cancelled"]),
  customerSignedName: z.string().optional(),
  customerSignatureUrl: z.string().url().optional(),
});

export const createQuoteFromOrderSchema = z.object({
  number: z.string().min(3),
  validUntil: z.string().datetime().optional(),
  items: z.array(z.object({
    kind: z.enum(["service", "part"]),
    description: z.string().min(2),
    quantity: z.number().positive().default(1),
    unitPrice: z.number().nonnegative().default(0),
    partId: z.string().optional(),
  })).min(1),
  discount: z.number().nonnegative().default(0),
});

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.output<T> {
  return schema.parse(body);
}

export type CreateCustomerInput = z.output<typeof createCustomerSchema>;
export type CreateEquipmentInput = z.output<typeof createEquipmentSchema>;
export type CreateServiceOrderInput = z.output<typeof createServiceOrderSchema>;
export type CreateContractInput = z.output<typeof createContractSchema>;
export type AddServiceOrderNoteInput = z.output<typeof addServiceOrderNoteSchema>;
export type AddServiceOrderPhotoInput = z.output<typeof addServiceOrderPhotoSchema>;
export type AnswerChecklistInput = z.output<typeof answerChecklistSchema>;
export type AddServiceOrderPartInput = z.output<typeof addServiceOrderPartSchema>;
export type UpdateServiceOrderStatusInput = z.output<typeof updateServiceOrderStatusSchema>;
export type CreateQuoteFromOrderInput = z.output<typeof createQuoteFromOrderSchema>;
