export const serviceOrderStatuses = [
  "draft",
  "open",
  "scheduled",
  "en_route",
  "in_progress",
  "waiting_approval",
  "completed",
  "cancelled",
] as const;

export type ServiceOrderStatus = (typeof serviceOrderStatuses)[number];

export const serviceOrderPriorities = ["low", "normal", "high", "emergency"] as const;

export type ServiceOrderPriority = (typeof serviceOrderPriorities)[number];

export const userRoles = [
  "owner",
  "admin",
  "dispatcher",
  "supervisor",
  "technician",
  "outsourced_technician",
  "customer",
] as const;

export type UserRole = (typeof userRoles)[number];

export type TenantBrand = {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
};

export const quoteStatuses = ["draft", "sent", "approved", "rejected", "expired", "cancelled"] as const;

export type QuoteStatus = (typeof quoteStatuses)[number];

export const contractRecurrenceMonths = [3, 4, 6] as const;

export type ContractRecurrenceMonths = (typeof contractRecurrenceMonths)[number];

export const notificationChannels = ["email", "whatsapp", "push", "internal"] as const;

export type NotificationChannel = (typeof notificationChannels)[number];

export const stockLocationTypes = ["warehouse", "vehicle", "technician", "outsourced"] as const;

export type StockLocationType = (typeof stockLocationTypes)[number];

export const aiRequestTypes = [
  "text_improvement",
  "issue_cause_suggestion",
  "service_order_summary",
  "checklist_suggestion",
] as const;

export type AiRequestType = (typeof aiRequestTypes)[number];

export { previewContractVisits } from "./contracts";
export type { ContractVisitPreview } from "./contracts";
