import { isPrismaEnabled } from "../config";
import { getPrisma } from "../database";
import { Prisma } from "@icemax/database";

type AuditInput = {
  tenantId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

const auditEvents: Array<AuditInput & { id: string; createdAt: string }> = [];

export async function recordAuditEvent(input: AuditInput) {
  if (isPrismaEnabled()) {
    await getPrisma().auditLog.create({
      data: {
        tenantId: input.tenantId,
        actorUserId: input.userId,
        action: input.action,
        entityType: input.entity,
        entityId: input.entityId ?? "unknown",
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return;
  }

  auditEvents.unshift({
    id: `audit-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...input,
  });
}

export async function listAuditEvents(tenantId: string) {
  if (isPrismaEnabled()) {
    const data = await getPrisma().auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { data, total: data.length };
  }

  const data = auditEvents.filter((event) => event.tenantId === tenantId);
  return { data, total: data.length };
}
