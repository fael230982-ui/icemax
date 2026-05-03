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

export const createPartSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(2),
  unit: z.string().default("un"),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  minimumStock: z.number().nonnegative().default(0),
});

export const createStockLocationSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["warehouse", "vehicle", "technician", "outsourced"]),
  technicianUserId: z.string().optional(),
});

export const createStockMovementSchema = z.object({
  partId: z.string().min(1),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
  serviceOrderId: z.string().optional(),
  quantity: z.number().positive(),
  reason: z.string().min(2),
});

export const generateContractVisitsSchema = z.object({
  occurrences: z.number().int().min(1).max(24).default(6),
  fromDate: z.string().datetime().optional(),
});

export const createOrderFromContractVisitSchema = z.object({
  title: z.string().min(3).default("Visita preventiva de contrato"),
  description: z.string().optional(),
  assignedTechnicianId: z.string().optional(),
});

export const createNotificationTemplateSchema = z.object({
  channel: z.enum(["email", "whatsapp", "push", "internal"]),
  name: z.string().min(2),
  subject: z.string().optional(),
  body: z.string().min(3),
  active: z.boolean().default(true),
});

export const updateIntegrationStatusSchema = z.object({
  provider: z.string().min(2),
  status: z.enum(["not_configured", "configured", "error", "disabled"]),
  config: z.record(z.unknown()).optional(),
});

export const updateQuoteDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  customerName: z.string().optional(),
  reason: z.string().optional(),
});

export const sendNotificationSchema = z.object({
  channel: z.enum(["email", "whatsapp", "push", "internal"]),
  recipient: z.string().min(3),
  subject: z.string().optional(),
  body: z.string().min(3),
  relatedType: z.string().optional(),
  relatedId: z.string().optional(),
});

export const uploadFileSchema = z.object({
  folder: z.enum(["uploads", "manuals", "signatures", "floor-plans", "reports"]).default("uploads"),
  fileName: z.string().min(3).regex(/^[\w.\- ]+$/),
  mimeType: z.string().min(3).default("application/octet-stream"),
  base64: z.string().min(1),
});

export const createQrLabelSchema = z.object({
  equipmentCode: z.string().min(2),
  equipment: z.string().min(2),
  customer: z.string().min(2),
  installLocation: z.string().min(2),
  qrPayload: z.string().min(3).optional(),
});

export const technicianLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  serviceOrderId: z.string().optional(),
  capturedAt: z.string().datetime().optional(),
});

export const optimizeRouteSchema = z.object({
  technicianUserId: z.string().min(1),
  origin: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  serviceOrderIds: z.array(z.string()).min(1).max(20),
});

export const improveTechnicalTextSchema = z.object({
  text: z.string().min(3),
  tone: z.enum(["professional", "objective", "customer_friendly"]).default("professional"),
});

export const suggestIssueCausesSchema = z.object({
  description: z.string().min(3),
  photoHints: z.array(z.string()).default([]),
  equipmentType: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.string().optional(),
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
export type CreatePartInput = z.output<typeof createPartSchema>;
export type CreateStockLocationInput = z.output<typeof createStockLocationSchema>;
export type CreateStockMovementInput = z.output<typeof createStockMovementSchema>;
export type GenerateContractVisitsInput = z.output<typeof generateContractVisitsSchema>;
export type CreateOrderFromContractVisitInput = z.output<typeof createOrderFromContractVisitSchema>;
export type CreateNotificationTemplateInput = z.output<typeof createNotificationTemplateSchema>;
export type UpdateIntegrationStatusInput = z.output<typeof updateIntegrationStatusSchema>;
export type LoginInput = z.output<typeof loginSchema>;
export type UpdateQuoteDecisionInput = z.output<typeof updateQuoteDecisionSchema>;
export type SendNotificationInput = z.output<typeof sendNotificationSchema>;
export type UploadFileInput = z.output<typeof uploadFileSchema>;
export type CreateQrLabelInput = z.output<typeof createQrLabelSchema>;
export type TechnicianLocationInput = z.output<typeof technicianLocationSchema>;
export type OptimizeRouteInput = z.output<typeof optimizeRouteSchema>;
export type ImproveTechnicalTextInput = z.output<typeof improveTechnicalTextSchema>;
export type SuggestIssueCausesInput = z.output<typeof suggestIssueCausesSchema>;
