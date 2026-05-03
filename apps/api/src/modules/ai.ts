import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { improveTechnicalTextSchema, parseBody, suggestIssueCausesSchema } from "../schemas";
import { improveTechnicalText, suggestIssueCauses } from "../services/ai-assistant-service";
import { recordAuditEvent } from "../services/audit-service";

export async function registerAiRoutes(app: FastifyInstance) {
  app.post("/ai/text-improve", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(improveTechnicalTextSchema, request.body);
    const result = improveTechnicalText(input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "ai.text_improved",
      entity: "ai_request",
      entityId: `ai-${Date.now()}`,
      metadata: { provider: result.provider, tone: input.tone },
    });

    return reply.code(201).send(result);
  });

  app.post("/ai/issue-cause-suggestions", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(suggestIssueCausesSchema, request.body);
    const result = suggestIssueCauses(input);

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "ai.issue_causes_suggested",
      entity: "ai_request",
      entityId: `ai-${Date.now()}`,
      metadata: { provider: result.provider, suggestions: result.suggestions.length },
    });

    return reply.code(201).send(result);
  });
}
