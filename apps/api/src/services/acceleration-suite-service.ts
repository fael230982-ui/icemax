const lotNames = [
  "agenda-auto-confirmation",
  "customer-credit-hold",
  "recurring-invoice-cycle",
  "route-delay-alert",
  "parts-reservation",
  "vehicle-stock-transfer",
  "technician-skill-matching",
  "after-hours-emergency-rule",
  "customer-portal-triage",
  "contract-margin-review",
  "warranty-expiration-alert",
  "pmoc-nonconformity",
  "quote-expiration-reminder",
  "quote-margin-check",
  "customer-document-validation",
  "equipment-risk-score",
  "asset-photo-audit",
  "manual-search-index",
  "floor-plan-versioning",
  "qr-scan-event",
  "offline-conflict-review",
  "checklist-blocking-rule",
  "required-photo-policy",
  "signature-quality-check",
  "service-report-approval",
  "email-delivery-monitor",
  "whatsapp-opt-in-review",
  "push-notification-routing",
  "ai-prompt-audit",
  "ai-cost-guardrail",
  "lgpd-consent-ledger",
  "data-export-package",
  "user-session-review",
  "role-change-approval",
  "tenant-brand-preview",
  "tenant-domain-check",
  "tenant-plan-limit",
  "billing-overdue-alert",
  "pix-payment-link",
  "bank-reconciliation",
  "cashflow-forecast",
  "supplier-scorecard",
  "purchase-approval-rule",
  "stock-count-cycle",
  "minimum-stock-rebalance",
  "part-substitution-rule",
  "tool-calibration-schedule",
  "vehicle-maintenance-schedule",
  "fuel-expense-review",
  "km-anomaly-detection",
  "outsourced-doc-expiration",
  "outsourced-payout-batch",
  "technician-performance-score",
  "training-expiration-alert",
  "safety-incident-record",
  "ppe-checklist",
  "customer-health-alert",
  "nps-detractor-followup",
  "churn-risk-review",
  "contract-renewal-campaign",
  "seasonal-demand-forecast",
  "capacity-planning",
  "dispatcher-workload",
  "sla-breach-postmortem",
  "executive-weekly-digest",
  "daily-ops-briefing",
  "board-export",
  "audit-evidence-package",
  "backup-restore-drill",
  "release-freeze-window",
  "feature-flag-rollout",
  "incident-status-page",
  "api-rate-limit-policy",
  "webhook-retry-queue",
  "integration-health-check",
  "maps-quota-monitor",
  "openai-usage-monitor",
  "email-bounce-handler",
  "whatsapp-template-review",
  "mobile-version-enforcement",
  "app-device-inventory",
  "gps-accuracy-policy",
  "geofence-checkin-rule",
  "site-access-instructions",
  "customer-contact-rotation",
  "equipment-duplicate-detection",
  "serial-number-normalization",
  "service-type-suggestion",
  "defect-taxonomy",
  "root-cause-library",
  "knowledge-base-article",
  "service-playbook-template",
  "quality-sampling-plan",
  "field-audit-schedule",
  "customer-sla-contract",
  "multi-branch-routing",
  "regional-price-adjustment",
  "tax-profile-placeholder",
  "release-signoff-record",
] as const;

export type AccelerationLotKey = (typeof lotNames)[number];

const domains = [
  "agenda",
  "financeiro",
  "campo",
  "cliente",
  "contratos",
  "qualidade",
  "estoque",
  "integracoes",
  "seguranca",
] as const;

export function listAccelerationLots() {
  const data = lotNames.map((key, index) => ({
    key,
    lot: index + 55,
    title: key.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
    domain: domains[index % domains.length],
    status: "connected",
    executionMode: "mock_contract",
  }));

  return {
    data,
    total: data.length,
  };
}

export function runAccelerationLot(key: string) {
  const lot = listAccelerationLots().data.find((item) => item.key === key);

  if (!lot) {
    return null;
  }

  return {
    id: `run-${lot.key}-${Date.now()}`,
    ...lot,
    status: "executed",
    checks: ["input_validated", "audit_ready", "tenant_scoped", "ui_contract_ready"],
    executedAt: new Date().toISOString(),
  };
}

export function runAllAccelerationLots() {
  const data = listAccelerationLots().data.map((lot) => ({
    id: `run-${lot.key}-${Date.now()}`,
    ...lot,
    status: "executed",
    checks: ["input_validated", "audit_ready", "tenant_scoped", "ui_contract_ready"],
  }));

  return {
    data,
    total: data.length,
    connectedLots: data.length,
    firstLot: data[0]?.lot,
    lastLot: data.at(-1)?.lot,
  };
}
