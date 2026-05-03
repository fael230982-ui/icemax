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
