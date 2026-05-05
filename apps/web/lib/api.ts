export type ApiListResponse<T> = {
  data: T[];
  total: number;
};

export type DashboardResponse = {
  tenant: {
    id: string;
    name: string;
    supportEmail: string;
    primaryColor: string;
    secondaryColor: string;
  };
  metrics: Array<{
    key: string;
    label: string;
    value: number;
    detail: string;
  }>;
  urgentOrders: unknown[];
  upcomingContractVisits: unknown[];
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ApiOptions = {
  token?: string;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "PUT";
};

function withQuery(path: string, query?: Record<string, string | undefined>) {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.size ? `${path}?${params.toString()}` : path;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar API: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const icemaxApi = {
  login: (body: { email: string; password: string; tenantId?: string }) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body }),
  me: (token: string) => apiRequest<unknown>("/auth/me", { token }),
  dashboard: (token?: string) => apiRequest<DashboardResponse>("/dashboard", { token }),
  serviceOrders: (token?: string, filters?: { status?: string; priority?: string; customer?: string }) =>
    apiRequest<ApiListResponse<unknown>>(withQuery("/service-orders", filters), { token }),
  createServiceOrder: (body: unknown, token?: string) =>
    apiRequest<unknown>("/service-orders", { method: "POST", body, token }),
  serviceOrderCompletionReview: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/completion-review`, { token }),
  serviceOrderEvidenceManifest: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/evidence-manifest`, { token }),
  postServicePlan: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/post-service-plan`, { token }),
  postServiceCommandCenter: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/post-service-command-center`, { token }),
  serviceOrderWarrantyPackage: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/warranty-package`, { token }),
  serviceOrderManualPackage: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/manual-package`, { token }),
  contractOpportunity: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/contract-opportunity`, { token }),
  contractOpportunityPipeline: (token?: string) => apiRequest<unknown>("/contracts/opportunity-pipeline", { token }),
  contractProposal: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/contract-proposal`, { token }),
  contractActivationPlan: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/contract-activation-plan`, { token }),
  contractAcceptancePackage: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/contract-acceptance-package`, { token }),
  activateContractAcceptance: (serviceOrderId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/contract-acceptance/activate`, { method: "POST", body, token }),
  customers: (token?: string) => apiRequest<ApiListResponse<unknown>>("/customers", { token }),
  createCustomer: (body: unknown, token?: string) => apiRequest<unknown>("/customers", { method: "POST", body, token }),
  equipment: (token?: string) => apiRequest<ApiListResponse<unknown>>("/equipment", { token }),
  createEquipment: (body: unknown, token?: string) => apiRequest<unknown>("/equipment", { method: "POST", body, token }),
  contracts: (token?: string) => apiRequest<ApiListResponse<unknown>>("/contracts", { token }),
  contractMaintenanceCalendar: (token?: string) => apiRequest<unknown>("/contracts/maintenance-calendar?occurrences=4", { token }),
  contractCapacityBoard: (token?: string) => apiRequest<unknown>("/contracts/capacity-board?occurrences=8", { token }),
  contractBillingPlan: (contractId: string, token?: string) => apiRequest<unknown>(`/contracts/${contractId}/billing-plan`, { token }),
  serviceOrderCommunicationPackage: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/communication-package`, { token }),
  contractCommunicationPackage: (contractId: string, token?: string) =>
    apiRequest<unknown>(`/contracts/${contractId}/communication-package`, { token }),
  createServiceOrderCommunicationQueue: (serviceOrderId: string, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/communication-queue`, { method: "POST", token }),
  createContractCommunicationQueue: (contractId: string, token?: string) =>
    apiRequest<unknown>(`/contracts/${contractId}/communication-queue`, { method: "POST", token }),
  createContract: (body: unknown, token?: string) => apiRequest<unknown>("/contracts", { method: "POST", body, token }),
  quotes: (token?: string) => apiRequest<ApiListResponse<unknown>>("/quotes", { token }),
  quoteApprovalBoard: (token?: string) => apiRequest<unknown>("/quotes/approval-board", { token }),
  createQuoteApprovalReminders: (token?: string) => apiRequest<unknown>("/quotes/approval-reminders", { method: "POST", token }),
  quoteApprovalPackage: (quoteId: string, token?: string) => apiRequest<unknown>(`/quotes/${quoteId}/approval-package`, { token }),
  quoteCommunicationPackage: (quoteId: string, token?: string) => apiRequest<unknown>(`/quotes/${quoteId}/communication-package`, { token }),
  createQuoteCommunicationQueue: (quoteId: string, token?: string) =>
    apiRequest<unknown>(`/quotes/${quoteId}/communication-queue`, { method: "POST", token }),
  quoteDecisionHandoff: (quoteId: string, token?: string) => apiRequest<unknown>(`/quotes/${quoteId}/decision-handoff`, { token }),
  activateApprovedQuote: (quoteId: string, token?: string) =>
    apiRequest<unknown>(`/quotes/${quoteId}/approval-activation`, { method: "POST", token }),
  quoteExecutionReadiness: (quoteId: string, token?: string) => apiRequest<unknown>(`/quotes/${quoteId}/execution-readiness`, { token }),
  quoteApprovalTimeline: (quoteId: string, token?: string) => apiRequest<unknown>(`/quotes/${quoteId}/approval-timeline`, { token }),
  publicQuote: (publicToken: string) => apiRequest<unknown>(`/public/quotes/${publicToken}`),
  publicQuoteDecision: (publicToken: string, body: unknown) =>
    apiRequest<unknown>(`/public/quotes/${publicToken}/decision`, { method: "PATCH", body }),
  stock: (token?: string) => apiRequest<ApiListResponse<unknown> & { alerts: unknown[] }>("/stock", { token }),
  integrations: (token?: string) => apiRequest<ApiListResponse<unknown>>("/integrations", { token }),
  uploadFile: (body: unknown, token?: string) => apiRequest<unknown>("/files", { method: "POST", body, token }),
  storageReadiness: (token?: string) => apiRequest<unknown>("/files/storage-readiness", { token }),
  createQrLabel: (body: unknown, token?: string) => apiRequest<unknown>("/qr-labels", { method: "POST", body, token }),
  floorPlanOperationalView: (floorPlanId: string, token?: string) =>
    apiRequest<unknown>(`/floor-plans/${floorPlanId}/operational-view`, { token }),
  auditLog: (token?: string) => apiRequest<ApiListResponse<unknown>>("/audit-log", { token }),
  technicianLocations: (token?: string) => apiRequest<ApiListResponse<unknown>>("/technicians/locations", { token }),
  optimizeRoute: (body: unknown, token?: string) => apiRequest<unknown>("/dispatch/routes/optimize", { method: "POST", body, token }),
  dispatchRecommendations: (token?: string) => apiRequest<unknown>("/dispatch/recommendations", { token }),
  quoteExecutionDispatchQueue: (token?: string) => apiRequest<unknown>("/dispatch/quote-execution-queue", { token }),
  fieldFinalizationBoard: (token?: string) => apiRequest<unknown>("/dispatch/finalization-board", { token }),
  completionEmailQueue: (token?: string) => apiRequest<unknown>("/dispatch/completion-email-queue", { token }),
  closeoutArchive: (serviceOrderId: string, token?: string) => apiRequest<unknown>(`/dispatch/service-orders/${serviceOrderId}/closeout-archive`, { token }),
  createDispatchAssignmentDecision: (body: unknown, token?: string) =>
    apiRequest<unknown>("/dispatch/assignment-decision", { method: "POST", body, token }),
  dispatchReadiness: (serviceOrderId: string, technicianUserId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/readiness`, { technicianUserId }), { token }),
  dispatchDepartureCommunication: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/departure-communication`, { technicianUserId, quoteId }), { token }),
  dispatchRouteTracking: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/route-tracking`, { technicianUserId, quoteId }), { token }),
  dispatchArrivalCheckIn: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/arrival-checkin`, { technicianUserId, quoteId }), { token }),
  fieldExecutionStart: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/execution-start`, { technicianUserId, quoteId }), { token }),
  fieldExecutionEvidence: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/execution-evidence`, { technicianUserId, quoteId }), { token }),
  fieldExecutionCloseout: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/execution-closeout`, { technicianUserId, quoteId }), { token }),
  fieldCustomerSignature: (serviceOrderId: string, technicianUserId: string, quoteId: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/customer-signature`, { technicianUserId, quoteId }), { token }),
  recordFieldCustomerSignature: (serviceOrderId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/dispatch/service-orders/${serviceOrderId}/customer-signature`, { method: "POST", body, token }),
  fieldCompletionEmail: (serviceOrderId: string, technicianUserId: string, quoteId: string, emailCopyToCustomer: string, token?: string) =>
    apiRequest<unknown>(withQuery(`/dispatch/service-orders/${serviceOrderId}/completion-email`, { technicianUserId, quoteId, emailCopyToCustomer }), { token }),
  queueFieldCompletionEmail: (serviceOrderId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/dispatch/service-orders/${serviceOrderId}/completion-email`, { method: "POST", body, token }),
  createVisitPreparation: (body: unknown, token?: string) =>
    apiRequest<unknown>("/dispatch/visit-preparation", { method: "POST", body, token }),
  improveText: (body: unknown, token?: string) => apiRequest<unknown>("/ai/text-improve", { method: "POST", body, token }),
  suggestCauses: (body: unknown, token?: string) =>
    apiRequest<unknown>("/ai/issue-cause-suggestions", { method: "POST", body, token }),
  createVisualDiagnosisPackage: (body: unknown, token?: string) =>
    apiRequest<unknown>("/ai/visual-diagnosis-package", { method: "POST", body, token }),
  customerPortalConfig: (tenantSlug: string) => apiRequest<unknown>(`/customer-portal/${tenantSlug}/config`),
  customerPortalBillingSummary: (tenantSlug: string) => apiRequest<unknown>(`/customer-portal/${tenantSlug}/billing-summary`),
  customerPortalAccessPolicy: (tenantSlug: string) => apiRequest<unknown>(`/customer-portal/${tenantSlug}/access-policy`),
  customerPortalExternalSharingPolicy: (tenantSlug: string) => apiRequest<unknown>(`/customer-portal/${tenantSlug}/external-sharing-policy`),
  customerPortalPublicTokens: (token?: string, filters?: { scope?: string; entityType?: string; entityId?: string; status?: string }) =>
    apiRequest<unknown>(withQuery("/customer-portal/public-tokens", filters), { token }),
  revokeCustomerPortalPublicTokenRecord: (recordId: string, body: { reason: string }, token?: string) =>
    apiRequest<unknown>(`/customer-portal/public-token-records/${recordId}/revoke`, { method: "POST", body, token }),
  validateCustomerPortalPublicToken: (publicToken: string, scope: "service_order_tracking" | "billing_summary") =>
    apiRequest<unknown>(withQuery(`/public/customer-portal/tokens/${publicToken}/validate`, { scope })),
  createCustomerPortalBillingAccessLink: (tenantSlug: string) =>
    apiRequest<unknown>(`/customer-portal/${tenantSlug}/billing-access-link`, { method: "POST" }),
  previewPortalTriage: (body: unknown) => apiRequest<unknown>("/customer-portal/triage", { method: "POST", body }),
  createPortalOrder: (body: unknown) => apiRequest<unknown>("/customer-portal/service-orders", { method: "POST", body }),
  customerOrderTracking: (serviceOrderId: string) => apiRequest<unknown>(`/customer-portal/service-orders/${serviceOrderId}/tracking`),
  createCustomerTrackingLink: (serviceOrderId: string) =>
    apiRequest<unknown>(`/customer-portal/service-orders/${serviceOrderId}/tracking-link`, { method: "POST" }),
  createCustomerPortalAttachments: (serviceOrderId: string, body: unknown) =>
    apiRequest<unknown>(`/customer-portal/service-orders/${serviceOrderId}/attachments`, { method: "POST", body }),
  slaBoard: (token?: string) => apiRequest<ApiListResponse<unknown>>("/sla/board", { token }),
  dayCommandCenter: (token?: string) => apiRequest<unknown>("/operations/day-command-center", { token }),
  createWarrantyTerm: (body: unknown, token?: string) => apiRequest<unknown>("/warranty-terms", { method: "POST", body, token }),
  createPmocPlan: (body: unknown, token?: string) => apiRequest<unknown>("/pmoc/plans", { method: "POST", body, token }),
  createInvoiceDraft: (body: unknown, token?: string) => apiRequest<unknown>("/billing/invoices/draft", { method: "POST", body, token }),
  recurringBillingBoard: (token?: string) => apiRequest<unknown>("/billing/recurring-board", { token }),
  receivablesBoard: (token?: string) => apiRequest<unknown>("/billing/receivables-board", { token }),
  collectionAutomationBoard: (token?: string) => apiRequest<unknown>("/billing/collection-automation-board", { token }),
  onboardTechnician: (body: unknown, token?: string) => apiRequest<unknown>("/technicians/onboarding", { method: "POST", body, token }),
  createMaintenanceWindow: (body: unknown, token?: string) => apiRequest<unknown>("/maintenance-windows", { method: "POST", body, token }),
  recordSatisfactionSurvey: (body: unknown, token?: string) => apiRequest<unknown>("/satisfaction-surveys", { method: "POST", body, token }),
  equipmentTimeline: (equipmentId: string, token?: string) => apiRequest<unknown>(`/equipment/${equipmentId}/timeline`, { token }),
  purchaseSuggestions: (token?: string) => apiRequest<ApiListResponse<unknown>>("/purchase-requests/suggestions", { token }),
  createPurchaseRequest: (body: unknown, token?: string) => apiRequest<unknown>("/purchase-requests", { method: "POST", body, token }),
  reserveServiceOrderParts: (serviceOrderId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/service-orders/${serviceOrderId}/parts-reservation`, { method: "POST", body, token }),
  createReleaseReadiness: (body: unknown, token?: string) => apiRequest<unknown>("/release-readiness", { method: "POST", body, token }),
  createWhitelabelBrand: (body: unknown, token?: string) => apiRequest<unknown>("/whitelabel/brands", { method: "POST", body, token }),
  createPermissionPolicy: (body: unknown, token?: string) => apiRequest<unknown>("/permissions/policies", { method: "POST", body, token }),
  createSecurityIncident: (body: unknown, token?: string) => apiRequest<unknown>("/security/incidents", { method: "POST", body, token }),
  createLgpdRequest: (body: unknown, token?: string) => apiRequest<unknown>("/lgpd/requests", { method: "POST", body, token }),
  geocodePreview: (body: unknown, token?: string) => apiRequest<unknown>("/maps/geocode-preview", { method: "POST", body, token }),
  communicationPreview: (body: unknown, token?: string) => apiRequest<unknown>("/communications/preview", { method: "POST", body, token }),
  createServiceCatalogItem: (body: unknown, token?: string) => apiRequest<unknown>("/service-catalog/items", { method: "POST", body, token }),
  createPriceBook: (body: unknown, token?: string) => apiRequest<unknown>("/price-books", { method: "POST", body, token }),
  executiveKpis: (token?: string) => apiRequest<unknown>("/kpis/executive", { token }),
  createKmReimbursement: (body: unknown, token?: string) => apiRequest<unknown>("/km-reimbursements", { method: "POST", body, token }),
  createTechnicianPayable: (body: unknown, token?: string) => apiRequest<unknown>("/technician-payables", { method: "POST", body, token }),
  createContractRenewal: (body: unknown, token?: string) => apiRequest<unknown>("/contract-renewals", { method: "POST", body, token }),
  customerHealth: (customerId: string, token?: string) => apiRequest<unknown>(`/customers/${customerId}/health`, { token }),
  equipmentDepreciation: (equipmentId: string, token?: string) => apiRequest<unknown>(`/equipment/${equipmentId}/depreciation`, { token }),
  createTrainingChecklist: (body: unknown, token?: string) => apiRequest<unknown>("/training/checklists", { method: "POST", body, token }),
  createManualImportJob: (body: unknown, token?: string) => apiRequest<unknown>("/manuals/import-jobs", { method: "POST", body, token }),
  createBackupPlan: (body: unknown, token?: string) => apiRequest<unknown>("/backup-plans", { method: "POST", body, token }),
  createIncidentPlaybook: (body: unknown, token?: string) => apiRequest<unknown>("/incident-playbooks", { method: "POST", body, token }),
  accelerationLots: (token?: string) => apiRequest<ApiListResponse<unknown>>("/acceleration/lots", { token }),
  runAccelerationLot: (key: string, token?: string) => apiRequest<unknown>(`/acceleration/lots/${key}/run`, { method: "POST", token }),
  runAllAccelerationLots: (token?: string) => apiRequest<unknown>("/acceleration/lots/run-all", { method: "POST", token }),
  platformReadiness: (token?: string) => apiRequest<unknown>("/platform/readiness", { token }),
  platformModules: (token?: string) => apiRequest<ApiListResponse<unknown>>("/platform/modules", { token }),
  platformRoles: (token?: string) => apiRequest<ApiListResponse<unknown>>("/platform/roles", { token }),
  platformDiagnostics: (token?: string) => apiRequest<unknown>("/platform/diagnostics", { token }),
  mobileOfflineEscalations: (token?: string) => apiRequest<unknown>("/platform/mobile-offline-escalations", { token }),
  mobileOfflineAssistedRetryPermissions: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/permissions", { token }),
  mobileOfflineAssistedRetryProductionGate: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/production-gate", { token }),
  mobileOfflineAssistedRetryAuditContract: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/audit-contract", { token }),
  mobileOfflineAssistedRetryExecutiveSummary: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/executive-summary", { token }),
  mobileOfflineAssistedRetryActionPlan: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/action-plan", { token }),
  mobileOfflineAssistedRetryDailyCommand: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/daily-command", { token }),
  mobileOfflineAssistedRetryDryRunBatch: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/dry-run-batch", { token }),
  mobileOfflineAssistedRetryEvidencePackage: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/evidence-package", { token }),
  mobileOfflineAssistedRetryFinalHomologation: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/final-homologation", { token }),
  mobileOfflineAssistedRetryControlledRelease: (token?: string) =>
    apiRequest<unknown>("/platform/mobile-offline-escalations/controlled-release", { token }),
  reviewMobileOfflineEscalation: (recordId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/platform/mobile-offline-escalations/${recordId}/review`, { method: "POST", body, token }),
  prepareMobileOfflineAssistedRetry: (recordId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/platform/mobile-offline-escalations/${recordId}/assisted-retry`, { method: "POST", body, token }),
  runMobileOfflineAssistedRetryDryRun: (recordId: string, body: unknown, token?: string) =>
    apiRequest<unknown>(`/platform/mobile-offline-escalations/${recordId}/assisted-retry/dry-run`, { method: "POST", body, token }),
  mobileOfflineAssistedRetryReadiness: (recordId: string, token?: string) =>
    apiRequest<unknown>(`/platform/mobile-offline-escalations/${recordId}/assisted-retry/readiness`, { token }),
  mobileOfflineEscalationTimeline: (recordId: string, token?: string) =>
    apiRequest<unknown>(`/platform/mobile-offline-escalations/${recordId}/timeline`, { token }),
  preReleaseGate: (token?: string) => apiRequest<unknown>("/platform/pre-release-gate", { token }),
  productionReadiness: (token?: string) => apiRequest<unknown>("/platform/production-readiness", { token }),
  endOfDaySnapshot: (token?: string) => apiRequest<unknown>("/platform/end-of-day-snapshot", { token }),
  apiContracts: (token?: string) => apiRequest<ApiListResponse<unknown> & { version: string }>("/api-contract/routes", { token }),
  homologationScenarios: (token?: string) => apiRequest<ApiListResponse<unknown>>("/homologation/scenarios", { token }),
  runHomologationScenario: (key: string, token?: string) =>
    apiRequest<unknown>(`/homologation/scenarios/${key}/run`, { method: "POST", token }),
  observabilitySummary: (token?: string) => apiRequest<unknown>("/observability/summary", { token }),
  demoDataSnapshot: (token?: string) => apiRequest<unknown>("/demo-data/snapshot", { token }),
  databaseCutoverPlan: (token?: string) => apiRequest<unknown>("/database/cutover-plan", { token }),
  databaseSchemaSummary: (token?: string) => apiRequest<unknown>("/database/schema-summary", { token }),
  databaseSeedPlan: (token?: string) => apiRequest<unknown>("/database/seed-plan", { token }),
  databaseEnvironmentChecklist: (token?: string) => apiRequest<unknown>("/database/environment-checklist", { token }),
  dataReadinessBoard: (token?: string) => apiRequest<unknown>("/database/data-readiness-board", { token }),
  tenantIsolationGate: (token?: string) => apiRequest<unknown>("/database/tenant-isolation-gate", { token }),
  databaseRollbackDrill: (token?: string) => apiRequest<unknown>("/database/rollback-drill", { token }),
  prismaSmokeTest: (token?: string) => apiRequest<unknown>("/database/prisma-smoke-test", { token }),
};
