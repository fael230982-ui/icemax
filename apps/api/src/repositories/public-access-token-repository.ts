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

type PublicAccessTokenFilters = {
  scope?: PublicAccessTokenScope;
  entityType?: "service_order" | "customer_portal";
  entityId?: string;
  status?: "active" | "revoked" | "expired" | "all";
};

type PublicAccessTokenRevocationOptions = {
  reason?: string;
};

type MockPublicAccessTokenRecord = {
  id: string;
  tenantId: string;
  tokenHashPreview: string;
  scope: PublicAccessTokenScope;
  entityType: "service_order" | "customer_portal";
  entityId: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
  lastAccessedAt?: string;
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

const mockPublicAccessTokens: MockPublicAccessTokenRecord[] = [];

function mergeRevocationMetadata(metadata: unknown, options?: PublicAccessTokenRevocationOptions) {
  const current = metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? metadata as Record<string, unknown>
    : {};

  return {
    ...current,
    ...(options?.reason ? { revocationReason: options.reason } : {}),
  };
}

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
  const tokenPackage = buildTokenPackage(input, "mock_hash_preview");
  mockPublicAccessTokens.unshift({
    id: `mock-public-token-${Date.now()}-${mockPublicAccessTokens.length + 1}`,
    tenantId: input.tenantId,
    tokenHashPreview: tokenPackage.tokenHashPreview,
    scope: input.scope,
    entityType: input.entityType,
    entityId: input.entityId,
    expiresAt: tokenPackage.expiresAt,
    createdAt: tokenPackage.issuedAt,
    metadata: {
      ...(input.metadata ?? {}),
      rawTokenStored: false,
    },
  });

  return tokenPackage;
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
  const tokenHashPreview = createPublicAccessTokenHashPreview(rawPublicAccessValue);
  const record = mockPublicAccessTokens.find((item) => item.tenantId === tenantId && item.tokenHashPreview === tokenHashPreview);

  if (!parsed || parsed.scope !== scope) {
    return { valid: false, reason: "not_found_or_scope_mismatch", tenantId };
  }

  if (record?.revokedAt) {
    return { valid: false, reason: "revoked", tenantId, entityType: parsed.entityType, entityId: parsed.entityId };
  }

  if (record && new Date(record.expiresAt) <= new Date()) {
    return { valid: false, reason: "expired", tenantId, entityType: parsed.entityType, entityId: parsed.entityId };
  }

  if (record) {
    record.lastAccessedAt = new Date().toISOString();
  }

  return {
    valid: true,
    reason: "active_mock",
    tenantId,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    scope: parsed.scope,
    rawTokenPersisted: false,
    hashPreview: tokenHashPreview,
    expiresAt: record?.expiresAt ?? "mock_expiration_checked_on_creation_package",
  };
}

export async function revokeMockPublicAccessToken(tenantId: string, rawPublicAccessValue: string, scope: PublicAccessTokenScope) {
  const parsed = parsePublicAccessTokenValue(rawPublicAccessValue);
  const tokenHashPreview = createPublicAccessTokenHashPreview(rawPublicAccessValue);
  const record = mockPublicAccessTokens.find((item) => item.tenantId === tenantId && item.tokenHashPreview === tokenHashPreview);

  if (!parsed || parsed.scope !== scope) {
    return { revoked: false, reason: "not_found_or_scope_mismatch", tenantId };
  }

  const alreadyRevoked = Boolean(record?.revokedAt);
  const revokedAt = record?.revokedAt ?? new Date().toISOString();

  if (record) {
    record.revokedAt = revokedAt;
  }

  return {
    revoked: true,
    reason: alreadyRevoked ? "already_revoked_mock" : "revoked_mock",
    tenantId,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    scope: parsed.scope,
    revokedAt,
    hashPreview: tokenHashPreview,
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

export async function revokeMockPublicAccessTokenById(tenantId: string, id: string, options: PublicAccessTokenRevocationOptions = {}) {
  const record = mockPublicAccessTokens.find((item) => item.tenantId === tenantId && item.id === id);

  if (!record) {
    return { revoked: false, reason: "not_found", tenantId, id };
  }

  const alreadyRevoked = Boolean(record.revokedAt);
  record.revokedAt ??= new Date().toISOString();
  record.metadata = mergeRevocationMetadata(record.metadata, options);

  return {
    revoked: true,
    reason: alreadyRevoked ? "already_revoked_mock" : "revoked_mock",
    tenantId,
    id: record.id,
    entityType: record.entityType,
    entityId: record.entityId,
    scope: record.scope,
    revokedAt: record.revokedAt,
    revocationReason: record.metadata.revocationReason,
    tokenHashPreview: record.tokenHashPreview,
    rawTokenPersisted: false,
  };
}

export async function revokePrismaPublicAccessTokenById(tenantId: string, id: string, options: PublicAccessTokenRevocationOptions = {}) {
  const record = await getPrisma().publicAccessToken.findFirst({
    where: { tenantId, id },
  });

  if (!record) {
    return { revoked: false, reason: "not_found", tenantId, id };
  }

  if (record.revokedAt) {
    return {
      revoked: true,
      reason: "already_revoked",
      tenantId,
      id: record.id,
      entityType: record.entityType,
      entityId: record.entityId,
      scope: record.scope,
      revokedAt: record.revokedAt.toISOString(),
      revocationReason: mergeRevocationMetadata(record.metadata).revocationReason,
      tokenHashPreview: `${record.tokenHash.slice(0, 12)}...`,
      rawTokenPersisted: false,
    };
  }

  const revokedAt = new Date();
  const metadata = mergeRevocationMetadata(record.metadata, options);
  await getPrisma().publicAccessToken.update({
    where: { id: record.id },
    data: { revokedAt, metadata: metadata as Prisma.InputJsonValue },
  });

  return {
    revoked: true,
    reason: "revoked",
    tenantId,
    id: record.id,
    entityType: record.entityType,
    entityId: record.entityId,
    scope: record.scope,
    revokedAt: revokedAt.toISOString(),
    revocationReason: metadata.revocationReason,
    tokenHashPreview: `${record.tokenHash.slice(0, 12)}...`,
    rawTokenPersisted: false,
  };
}

function publicTokenStatus(expiresAt: string | Date, revokedAt?: string | Date | null) {
  if (revokedAt) {
    return "revoked";
  }

  return new Date(expiresAt) <= new Date() ? "expired" : "active";
}

function matchesPublicTokenFilters(
  record: { scope: string; entityType: string; entityId: string; expiresAt: string | Date; revokedAt?: string | Date | null },
  filters: PublicAccessTokenFilters,
) {
  const status = publicTokenStatus(record.expiresAt, record.revokedAt);

  if (filters.scope && record.scope !== filters.scope) {
    return false;
  }

  if (filters.entityType && record.entityType !== filters.entityType) {
    return false;
  }

  if (filters.entityId && record.entityId !== filters.entityId) {
    return false;
  }

  if (filters.status && filters.status !== "all" && status !== filters.status) {
    return false;
  }

  return true;
}

export async function listMockPublicAccessTokens(tenantId: string, filters: PublicAccessTokenFilters = {}) {
  const data = mockPublicAccessTokens
    .filter((item) => item.tenantId === tenantId)
    .filter((item) => matchesPublicTokenFilters(item, filters))
    .map((item) => ({
      id: item.id,
      tenantId: item.tenantId,
      tokenHashPreview: item.tokenHashPreview,
      scope: item.scope,
      entityType: item.entityType,
      entityId: item.entityId,
      status: publicTokenStatus(item.expiresAt, item.revokedAt),
      expiresAt: item.expiresAt,
      revokedAt: item.revokedAt,
      lastAccessedAt: item.lastAccessedAt,
      createdAt: item.createdAt,
      rawTokenPersisted: false,
      metadata: item.metadata,
    }));

  return {
    data,
    total: data.length,
    summary: {
      active: data.filter((item) => item.status === "active").length,
      revoked: data.filter((item) => item.status === "revoked").length,
      expired: data.filter((item) => item.status === "expired").length,
    },
  };
}

export async function listPrismaPublicAccessTokens(tenantId: string, filters: PublicAccessTokenFilters = {}) {
  const data = await getPrisma().publicAccessToken.findMany({
    where: {
      tenantId,
      scope: filters.scope,
      entityType: filters.entityType,
      entityId: filters.entityId,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const filtered = data.filter((item) => matchesPublicTokenFilters(item, filters));
  const normalized = filtered.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    tokenHashPreview: `${item.tokenHash.slice(0, 12)}...`,
    scope: item.scope,
    entityType: item.entityType,
    entityId: item.entityId,
    customerId: item.customerId,
    customerEmail: item.customerEmail,
    customerPhone: item.customerPhone,
    status: publicTokenStatus(item.expiresAt, item.revokedAt),
    expiresAt: item.expiresAt.toISOString(),
    revokedAt: item.revokedAt?.toISOString(),
    lastAccessedAt: item.lastAccessedAt?.toISOString(),
    createdAt: item.createdAt.toISOString(),
    rawTokenPersisted: false,
    metadata: item.metadata,
  }));

  return {
    data: normalized,
    total: normalized.length,
    summary: {
      active: normalized.filter((item) => item.status === "active").length,
      revoked: normalized.filter((item) => item.status === "revoked").length,
      expired: normalized.filter((item) => item.status === "expired").length,
    },
  };
}
