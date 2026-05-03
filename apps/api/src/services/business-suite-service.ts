import { equipment, serviceContracts, serviceOrders, stock } from "../mock-data";
import type {
  CreateInvoiceDraftInput,
  CreateMaintenanceWindowInput,
  CreatePmocPlanInput,
  CreatePurchaseRequestInput,
  CreateWarrantyTermInput,
  OnboardTechnicianInput,
  ReleaseReadinessInput,
  SatisfactionSurveyInput,
} from "../schemas";

export function calculateSlaBoard() {
  const data = serviceOrders.map((order) => {
    const emergency = order.priority === "emergency";
    const targetMinutes = emergency ? 60 : order.priority === "high" ? 180 : 480;
    const elapsedMinutes = order.status === "in_progress" ? 42 : order.status === "en_route" ? 18 : 0;

    return {
      serviceOrderId: order.id,
      customer: order.customer,
      priority: order.priority,
      status: order.status,
      targetMinutes,
      elapsedMinutes,
      remainingMinutes: Math.max(0, targetMinutes - elapsedMinutes),
      risk: elapsedMinutes > targetMinutes * 0.75 ? "high" : emergency ? "attention" : "normal",
    };
  });

  return { data, total: data.length };
}

export function createWarrantyTerm(input: CreateWarrantyTermInput) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + input.coverageDays);

  return {
    id: `warranty-${Date.now()}`,
    status: "issued",
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ...input,
  };
}

export function createPmocPlan(input: CreatePmocPlanInput) {
  return {
    id: `pmoc-${Date.now()}`,
    status: "active",
    inspectionsPerYear: Math.ceil(12 / input.inspectionFrequencyMonths),
    requiredRecords: ["limpeza", "medicoes", "responsavel tecnico", "nao conformidades", "acoes corretivas"],
    ...input,
  };
}

export function createInvoiceDraft(input: CreateInvoiceDraftInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return {
    id: `invoice-${Date.now()}`,
    status: "draft",
    subtotal,
    total: subtotal,
    createdAt: new Date().toISOString(),
    ...input,
  };
}

export function onboardTechnician(input: OnboardTechnicianInput) {
  return {
    id: `tech-${Date.now()}`,
    status: input.documentStatus === "approved" ? "active" : "pending_documents",
    accessProfile: input.kind === "outsourced" ? "limited_field_access" : "field_access",
    ...input,
  };
}

export function createMaintenanceWindow(input: CreateMaintenanceWindowInput) {
  const contract = serviceContracts.find((item) => item.id === input.contractId);
  return {
    id: `window-${Date.now()}`,
    status: "planned",
    customer: contract?.customer ?? input.customerId,
    nextActions: ["confirmar disponibilidade", "agendar tecnico", "gerar OS preventiva"],
    ...input,
  };
}

export function recordSatisfactionSurvey(input: SatisfactionSurveyInput) {
  return {
    id: `survey-${Date.now()}`,
    npsGroup: input.score >= 9 ? "promoter" : input.score >= 7 ? "neutral" : "detractor",
    createdAt: new Date().toISOString(),
    ...input,
  };
}

export function getEquipmentTimeline(equipmentId: string) {
  const item = equipment.find((entry) => entry.id === equipmentId);
  const data = [
    { date: "2026-02-03", type: "install", title: "Cadastro inicial do equipamento" },
    { date: "2026-03-18", type: "preventive", title: "Preventiva e higienizacao" },
    { date: "2026-05-03", type: "service_order", title: "Atendimento corretivo vinculado" },
  ];

  return {
    equipment: item ?? { id: equipmentId },
    data,
    total: data.length,
  };
}

export function suggestPurchaseRequests() {
  const alerts = stock
    .filter((item) => item.quantity < item.minimum)
    .map((item) => ({
      sku: item.sku,
      name: item.name,
      location: item.location,
      currentQuantity: item.quantity,
      minimumStock: item.minimum,
      suggestedQuantity: Math.max(item.minimum * 2 - item.quantity, 1),
      reason: "estoque abaixo do minimo",
    }));

  return { data: alerts, total: alerts.length };
}

export function createPurchaseRequest(input: CreatePurchaseRequestInput) {
  return {
    id: `purchase-${Date.now()}`,
    status: "requested",
    requestedAt: new Date().toISOString(),
    ...input,
  };
}

export function createReleaseReadiness(input: ReleaseReadinessInput) {
  const checks = [
    { key: "typecheck", status: "required" },
    { key: "tests", status: "required" },
    { key: "web_build", status: "required" },
    { key: "docs_pdf", status: "required" },
    { key: "secrets_review", status: input.includeSecurityReview ? "required" : "skipped" },
  ];

  return {
    id: `release-${Date.now()}`,
    status: "pending_validation",
    createdAt: new Date().toISOString(),
    checks,
    ...input,
  };
}
