import { Prisma } from "@icemax/database";
import { getPrisma } from "../database";
import {
  buildPublicAccessUrl,
  createPublicAccessTokenHashPreview,
  createPublicAccessTokenValue,
  hashPublicAccessToken,
  parsePublicAccessTokenValue,
  type PublicAccessTokenScope,
} from "../services/public-access-token-service";

type IssuePublicAccessTokenInput = {
  tenantId: string;
  prefix: "track" | "billing";
  scope: PublicAccessTokenScope;
  entityType: "service_order" | "customer_portal";
  entityId: string;
  expiresInDays: number;
  path: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdByUserId?: string;
  metadata?: Record<string, unknown>;
};

export type PublicAccessTokenPackage = {
  token: string;
  tokenHashPreview: string;
  publicUrl: string;
  issuedAt: string;
  expiresAt: string;
  expiresInDays: number;
  persistence: "mock_hash_preview" | "prisma_hash";
  scope: PublicAccessTokenScope;
  rawTokenPersisted: false;
  hashPersistedInProduction: true;
};

function createTokenDates(expiresInDays: number) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  return { issuedAt, expiresAt };
}

function buildTokenPackage(input: IssuePublicAccessTokenInput, persistence: PublicAccessTokenPackage["persistence"]): PublicAccessTokenPackage {
  const { issuedAt, expiresAt } = createTokenDates(input.expiresInDays);
  const rawPublicAccessValue = createPublicAccessTokenValue({ prefix: input.prefix, entityId: input.entityId });

  return {
    ["token"]: rawPublicAccessValue,
    tokenHashPreview: createPublicAccessTokenHashPreview(rawPublicAccessValue),
    publicUrl: buildPublicAccessUrl(input.path, rawPublicAccessValue),
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    expiresInDays: input.expiresInDays,
    persistence,
    scope: input.scope,
    rawTokenPersisted: false,
    hashPersistedInProduction: true,
  };
}

export async function issueMockPublicAccessToken(input: IssuePublicAccessTokenInput) {
  return buildTokenPackage(input, "mock_hash_preview");
}

export async function issuePrismaPublicAccessToken(input: IssuePublicAccessTokenInput) {
  const tokenPackage = buildTokenPackage(input, "prisma_hash");

  await getPrisma().publicAccessToken.create({
    data: {
      tenantId: input.tenantId,
      tokenHash: hashPublicAccessToken(tokenPackage.token),
      scope: input.scope,
      entityType: input.entityType,
      entityId: input.entityId,
      customerId: input.customerId,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      expiresAt: new Date(tokenPackage.expiresAt),
      createdByUserId: input.createdByUserId,
      metadata: {
        ...(input.metadata ?? {}),
        rawTokenStored: false,
        tokenHashPreview: tokenPackage.tokenHashPreview,
      } as Prisma.InputJsonValue,
    },
  });

  return tokenPackage;
}

export async function validatePrismaPublicAccessToken(tenantId: string, token: string, scope: PublicAccessTokenScope) {
  const tokenHash = hashPublicAccessToken(token);
  const record = await getPrisma().publicAccessToken.findUnique({
    where: { tenantId_tokenHash: { tenantId, tokenHash } },
  });
  const now = new Date();

  if (!record || record.scope !== scope) {
    return { valid: false, reason: "not_found_or_scope_mismatch" };
  }

  if (record.revokedAt) {
    return { valid: false, reason: "revoked", entityType: record.entityType, entityId: record.entityId };
  }

  if (record.expiresAt <= now) {
    return { valid: false, reason: "expired", entityType: record.entityType, entityId: record.entityId };
  }

  await getPrisma().publicAccessToken.update({
    where: { id: record.id },
    data: { lastAccessedAt: now },
  });

  return {
    valid: true,
    reason: "active",
    entityType: record.entityType,
    entityId: record.entityId,
    customerId: record.customerId,
    expiresAt: record.expiresAt.toISOString(),
  };
}

export async function validateMockPublicAccessToken(tenantId: string, rawPublicAccessValue: string, scope: PublicAccessTokenScope) {
  const parsed = parsePublicAccessTokenValue(rawPublicAccessValue);

  if (!parsed || parsed.scope !== scope) {
    return { valid: false, reason: "not_found_or_scope_mismatch", tenantId };
  }

  return {
    valid: true,
    reason: "active_mock",
    tenantId,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    scope: parsed.scope,
    rawTokenPersisted: false,
    hashPreview: createPublicAccessTokenHashPreview(rawPublicAccessValue),
    expiresAt: "mock_expiration_checked_on_creation_package",
  };
}

export async function revokeMockPublicAccessToken(tenantId: string, rawPublicAccessValue: string, scope: PublicAccessTokenScope) {
  const parsed = parsePublicAccessTokenValue(rawPublicAccessValue);

  if (!parsed || parsed.scope !== scope) {
    return { revoked: false, reason: "not_found_or_scope_mismatch", tenantId };
  }

  return {
    revoked: true,
    reason: "revoked_mock",
    tenantId,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    scope: parsed.scope,
    revokedAt: new Date().toISOString(),
    hashPreview: createPublicAccessTokenHashPreview(rawPublicAccessValue),
    rawTokenPersisted: false,
  };
}

export async function revokePrismaPublicAccessToken(tenantId: string, rawPublicAccessValue: string, scope: PublicAccessTokenScope) {
  const tokenHash = hashPublicAccessToken(rawPublicAccessValue);
  const record = await getPrisma().publicAccessToken.findUnique({
    where: { tenantId_tokenHash: { tenantId, tokenHash } },
  });

  if (!record || record.scope !== scope) {
    return { revoked: false, reason: "not_found_or_scope_mismatch", tenantId };
  }

  if (record.revokedAt) {
    return {
      revoked: true,
      reason: "already_revoked",
      tenantId,
      entityType: record.entityType,
      entityId: record.entityId,
      scope: record.scope,
      revokedAt: record.revokedAt.toISOString(),
    };
  }

  const revokedAt = new Date();
  await getPrisma().publicAccessToken.update({
    where: { id: record.id },
    data: { revokedAt },
  });

  return {
    revoked: true,
    reason: "revoked",
    tenantId,
    entityType: record.entityType,
    entityId: record.entityId,
    scope: record.scope,
    revokedAt: revokedAt.toISOString(),
  };
}
