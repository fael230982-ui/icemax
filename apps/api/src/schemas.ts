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

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.output<T> {
  return schema.parse(body);
}

export type CreateCustomerInput = z.output<typeof createCustomerSchema>;
export type CreateEquipmentInput = z.output<typeof createEquipmentSchema>;
export type CreateServiceOrderInput = z.output<typeof createServiceOrderSchema>;
export type CreateContractInput = z.output<typeof createContractSchema>;
