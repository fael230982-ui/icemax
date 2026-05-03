import { customers, equipment, integrations, serviceContracts, serviceOrders, tenant } from "../mock-data";
import type {
  BackupPlanInput,
  CommunicationPreviewInput,
  ContractRenewalInput,
  KmReimbursementInput,
  LgpdRequestInput,
  NamedRecordInput,
  TechnicianPayableInput,
} from "../schemas";

export function createWhitelabelBrand(input: NamedRecordInput) {
  return {
    id: `brand-${Date.now()}`,
    tenantId: tenant.id,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    status: "draft",
    ...input,
  };
}

export function createPermissionPolicy(input: NamedRecordInput) {
  return {
    id: `policy-${Date.now()}`,
    status: "active",
    rules: ["tenant_isolation", "role_based_access", "audit_required"],
    ...input,
  };
}

export function createSecurityIncident(input: NamedRecordInput) {
  return {
    id: `security-${Date.now()}`,
    severity: "medium",
    status: "open",
    openedAt: new Date().toISOString(),
    ...input,
  };
}

export function createLgpdRequest(input: LgpdRequestInput) {
  return {
    id: `lgpd-${Date.now()}`,
    status: "received",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    ...input,
  };
}

export function previewMapGeocode(input: NamedRecordInput) {
  return {
    id: `geo-${Date.now()}`,
    query: input.name,
    provider: "local_mock",
    latitude: -23.55052,
    longitude: -46.633308,
    confidence: "mock",
  };
}

export function previewCommunication(input: CommunicationPreviewInput) {
  return {
    id: `${input.channel}-${Date.now()}`,
    status: "preview",
    provider: input.channel === "email" ? "email_mock" : input.channel === "whatsapp" ? "whatsapp_mock" : "push_mock",
    renderedBody: `${input.template}: ${Object.entries(input.variables).map(([key, value]) => `${key}=${value}`).join(", ")}`,
    ...input,
  };
}

export function createServiceCatalogItem(input: NamedRecordInput) {
  return {
    id: `catalog-${Date.now()}`,
    active: true,
    defaultChecklist: "checklist-001",
    ...input,
  };
}

export function createPriceBook(input: NamedRecordInput) {
  return {
    id: `pricebook-${Date.now()}`,
    status: "active",
    currency: "BRL",
    items: [
      { description: "Visita tecnica", unitPrice: 180 },
      { description: "Higienizacao split", unitPrice: 280 },
    ],
    ...input,
  };
}

export function getExecutiveKpis() {
  return {
    tenant: tenant.name,
    openOrders: serviceOrders.length,
    activeContracts: serviceContracts.length,
    customers: customers.length,
    equipment: equipment.length,
    integrationsConfigured: integrations.filter((item) => item.status === "configured").length,
  };
}

export function createKmReimbursement(input: KmReimbursementInput) {
  return {
    id: `km-${Date.now()}`,
    status: "pending_approval",
    total: Number((input.kilometers * input.ratePerKm).toFixed(2)),
    ...input,
  };
}

export function createTechnicianPayable(input: TechnicianPayableInput) {
  return {
    id: `payable-${Date.now()}`,
    status: "pending",
    netAmount: Math.max(0, input.grossAmount - input.discountAmount),
    ...input,
  };
}

export function createContractRenewal(input: ContractRenewalInput) {
  return {
    id: `renewal-${Date.now()}`,
    status: "proposal",
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    ...input,
  };
}

export function getCustomerHealth(customerId: string) {
  return {
    customerId,
    score: 82,
    status: "healthy",
    signals: ["contrato ativo", "sem atraso critico", "NPS positivo"],
  };
}

export function getAssetDepreciation(equipmentId: string) {
  return {
    equipmentId,
    estimatedAgeMonths: 18,
    estimatedRemainingLifeMonths: 102,
    replacementRisk: "low",
  };
}

export function createTrainingChecklist(input: NamedRecordInput) {
  return {
    id: `training-${Date.now()}`,
    status: "published",
    modules: ["seguranca", "checklist", "fotos", "assinatura", "LGPD"],
    ...input,
  };
}

export function createManualImportJob(input: NamedRecordInput) {
  return {
    id: `manual-import-${Date.now()}`,
    status: "queued",
    source: input.description ?? "manual upload",
    name: input.name,
  };
}

export function createBackupPlan(input: BackupPlanInput) {
  return {
    id: `backup-${Date.now()}`,
    status: "scheduled",
    nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...input,
  };
}

export function createIncidentPlaybook(input: NamedRecordInput) {
  return {
    id: `playbook-${Date.now()}`,
    status: "active",
    steps: ["identificar impacto", "comunicar responsaveis", "conter", "corrigir", "registrar pos-mortem"],
    ...input,
  };
}
