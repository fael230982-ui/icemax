import type { FastifyInstance } from "fastify";
import {
  getEndOfDaySnapshot,
  getModuleCatalog,
  getMobileOfflineAssistedRetryActionPlan,
  getMobileOfflineAssistedRetryAuditContract,
  getMobileOfflineAssistedRetryDailyCommand,
  getMobileOfflineAssistedRetryDryRunBatch,
  getMobileOfflineAssistedRetryEvidencePackage,
  getMobileOfflineAssistedRetryExecutiveSummary,
  getMobileOfflineAssistedRetryFinalHomologationMatrix,
  getMobileOfflineAssistedRetryPermissions,
  getMobileOfflineAssistedRetryProductionGate,
  getMobileOfflineAssistedRetryProductionReadinessBoard,
  getMobileOfflineAssistedRetryReadiness,
  getMobileOfflineAssistedRetryControlledReleasePlan,
  getMobileOfflineAssistedRetryInfrastructureBacklog,
  getMobileOfflineAssistedRetryProviderCostPlan,
  getMobileOfflineAssistedRetryProviderActivationGate,
  getMobileOfflineAssistedRetryProviderHomologationRunbook,
  getMobileOfflineAssistedRetryProviderEvidenceBoard,
  getMobileOfflineAssistedRetryTenantActivationDecisionPackage,
  getMobileOfflineAssistedRetryWhitelabelRolloutPlan,
  getMobileOfflineAssistedRetryWhitelabelOnboardingChecklist,
  getMobileOfflineAssistedRetryWhitelabelOperationalHandoff,
  getMobileOfflineAssistedRetryWhitelabelGoLiveReadinessBoard,
  getMobileOfflineAssistedRetryWhitelabelPostGoLivePlan,
  getMobileOfflineAssistedRetryWhitelabelTenantHealthScore,
  getMobileOfflineAssistedRetryWhitelabelContinuousImprovementPlan,
  getMobileOfflineAssistedRetryWhitelabelScaleDecisionPackage,
  getMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding,
  getMobileOfflineAssistedRetryWhitelabelTenantCostMatrix,
  getMobileOfflineAssistedRetryWhitelabelOperationalContractPack,
  getMobileOfflineAssistedRetryWhitelabelSupportSlaGate,
  getMobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate,
  getMobileOfflineAssistedRetryWhitelabelPartnerGoLiveAcceptance,
  getMobileOfflineAssistedRetryWhitelabelEndOfDayClosure,
  getMobileOfflineAssistedRetryWhitelabelMorningCommand,
  getMobileOfflineAssistedRetryWhitelabelProductionExecutionMatrix,
  getPlatformDiagnostics,
  getProductAuditSnapshot,
  getPlatformReadiness,
  getMobileOfflineEscalationBoard,
  executeMobileOfflineAssistedRetryDryRun,
  getMobileOfflineEscalationTimeline,
  prepareMobileOfflineAssistedRetry,
  getPreReleaseGate,
  getProductionReadinessPlan,
  getRoleMatrix,
  reviewMobileOfflineEscalation,
} from "../services/platform-service";

export async function registerPlatformRoutes(app: FastifyInstance) {
  app.get("/platform/readiness", async () => getPlatformReadiness());
  app.get("/platform/modules", async () => getModuleCatalog());
  app.get("/platform/roles", async () => getRoleMatrix());
  app.get("/platform/diagnostics", async () => getPlatformDiagnostics());
  app.get("/platform/mobile-offline-escalations", async () => getMobileOfflineEscalationBoard());
  app.get("/platform/mobile-offline-escalations/permissions", async () => getMobileOfflineAssistedRetryPermissions());
  app.get("/platform/mobile-offline-escalations/production-gate", async () => getMobileOfflineAssistedRetryProductionGate());
  app.get("/platform/mobile-offline-escalations/audit-contract", async () => getMobileOfflineAssistedRetryAuditContract());
  app.get("/platform/mobile-offline-escalations/executive-summary", async () => getMobileOfflineAssistedRetryExecutiveSummary());
  app.get("/platform/mobile-offline-escalations/action-plan", async () => getMobileOfflineAssistedRetryActionPlan());
  app.get("/platform/mobile-offline-escalations/daily-command", async () => getMobileOfflineAssistedRetryDailyCommand());
  app.get("/platform/mobile-offline-escalations/dry-run-batch", async () => getMobileOfflineAssistedRetryDryRunBatch());
  app.get("/platform/mobile-offline-escalations/evidence-package", async () => getMobileOfflineAssistedRetryEvidencePackage());
  app.get("/platform/mobile-offline-escalations/final-homologation", async () => getMobileOfflineAssistedRetryFinalHomologationMatrix());
  app.get("/platform/mobile-offline-escalations/controlled-release", async () => getMobileOfflineAssistedRetryControlledReleasePlan());
  app.get("/platform/mobile-offline-escalations/production-readiness", async () => getMobileOfflineAssistedRetryProductionReadinessBoard());
  app.get("/platform/mobile-offline-escalations/infrastructure-backlog", async () => getMobileOfflineAssistedRetryInfrastructureBacklog());
  app.get("/platform/mobile-offline-escalations/provider-cost-plan", async () => getMobileOfflineAssistedRetryProviderCostPlan());
  app.get("/platform/mobile-offline-escalations/provider-activation-gate", async () => getMobileOfflineAssistedRetryProviderActivationGate());
  app.get("/platform/mobile-offline-escalations/provider-homologation-runbook", async () => getMobileOfflineAssistedRetryProviderHomologationRunbook());
  app.get("/platform/mobile-offline-escalations/provider-evidence-board", async () => getMobileOfflineAssistedRetryProviderEvidenceBoard());
  app.get("/platform/mobile-offline-escalations/tenant-activation-decision", async () => getMobileOfflineAssistedRetryTenantActivationDecisionPackage());
  app.get("/platform/mobile-offline-escalations/whitelabel-rollout-plan", async () => getMobileOfflineAssistedRetryWhitelabelRolloutPlan());
  app.get("/platform/mobile-offline-escalations/whitelabel-onboarding-checklist", async () => getMobileOfflineAssistedRetryWhitelabelOnboardingChecklist());
  app.get("/platform/mobile-offline-escalations/whitelabel-operational-handoff", async () => getMobileOfflineAssistedRetryWhitelabelOperationalHandoff());
  app.get("/platform/mobile-offline-escalations/whitelabel-go-live-readiness", async () => getMobileOfflineAssistedRetryWhitelabelGoLiveReadinessBoard());
  app.get("/platform/mobile-offline-escalations/whitelabel-post-go-live-plan", async () => getMobileOfflineAssistedRetryWhitelabelPostGoLivePlan());
  app.get("/platform/mobile-offline-escalations/whitelabel-tenant-health-score", async () => getMobileOfflineAssistedRetryWhitelabelTenantHealthScore());
  app.get("/platform/mobile-offline-escalations/whitelabel-continuous-improvement", async () => getMobileOfflineAssistedRetryWhitelabelContinuousImprovementPlan());
  app.get("/platform/mobile-offline-escalations/whitelabel-scale-decision", async () => getMobileOfflineAssistedRetryWhitelabelScaleDecisionPackage());
  app.get("/platform/mobile-offline-escalations/whitelabel-second-tenant-pre-onboarding", async () => getMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding());
  app.get("/platform/mobile-offline-escalations/whitelabel-tenant-cost-matrix", async () => getMobileOfflineAssistedRetryWhitelabelTenantCostMatrix());
  app.get("/platform/mobile-offline-escalations/whitelabel-operational-contract-pack", async () => getMobileOfflineAssistedRetryWhitelabelOperationalContractPack());
  app.get("/platform/mobile-offline-escalations/whitelabel-support-sla-gate", async () => getMobileOfflineAssistedRetryWhitelabelSupportSlaGate());
  app.get("/platform/mobile-offline-escalations/whitelabel-security-privacy-gate", async () => getMobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate());
  app.get("/platform/mobile-offline-escalations/whitelabel-partner-go-live-acceptance", async () => getMobileOfflineAssistedRetryWhitelabelPartnerGoLiveAcceptance());
  app.get("/platform/mobile-offline-escalations/whitelabel-end-of-day-closure", async () => getMobileOfflineAssistedRetryWhitelabelEndOfDayClosure());
  app.get("/platform/mobile-offline-escalations/whitelabel-morning-command", async () => getMobileOfflineAssistedRetryWhitelabelMorningCommand());
  app.get("/platform/mobile-offline-escalations/whitelabel-production-execution-matrix", async () => getMobileOfflineAssistedRetryWhitelabelProductionExecutionMatrix());
  app.post<{ Params: { recordId: string }; Body: unknown }>("/platform/mobile-offline-escalations/:recordId/review", async (request, reply) => {
    return reply.code(201).send(reviewMobileOfflineEscalation(request.params.recordId, request.body));
  });
  app.post<{ Params: { recordId: string }; Body: unknown }>("/platform/mobile-offline-escalations/:recordId/assisted-retry", async (request, reply) => {
    return reply.code(202).send(prepareMobileOfflineAssistedRetry(request.params.recordId, request.body));
  });
  app.post<{ Params: { recordId: string }; Body: unknown }>("/platform/mobile-offline-escalations/:recordId/assisted-retry/dry-run", async (request, reply) => {
    return reply.code(202).send(executeMobileOfflineAssistedRetryDryRun(request.params.recordId, request.body));
  });
  app.get<{ Params: { recordId: string } }>("/platform/mobile-offline-escalations/:recordId/assisted-retry/readiness", async (request) =>
    getMobileOfflineAssistedRetryReadiness(request.params.recordId));
  app.get<{ Params: { recordId: string } }>("/platform/mobile-offline-escalations/:recordId/timeline", async (request) =>
    getMobileOfflineEscalationTimeline(request.params.recordId));
  app.get("/platform/pre-release-gate", async () => getPreReleaseGate());
  app.get("/platform/production-readiness", async () => getProductionReadinessPlan());
  app.get("/platform/product-audit-snapshot", async () => getProductAuditSnapshot());
  app.get("/platform/end-of-day-snapshot", async () => getEndOfDaySnapshot());
}
