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
  getPlatformDiagnostics,
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
  app.get("/platform/end-of-day-snapshot", async () => getEndOfDaySnapshot());
}
