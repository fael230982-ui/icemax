import { createHash, randomBytes } from "node:crypto";
import { config } from "../config";

export type PublicAccessTokenScope = "service_order_tracking" | "billing_summary";

type CreateTokenInput = {
  prefix: "track" | "billing";
  entityId: string;
};

export function createPublicAccessTokenValue(input: CreateTokenInput) {
  const entropy = randomBytes(18).toString("base64url");
  return `${input.prefix}_${input.entityId}_${entropy}`;
}

export function parsePublicAccessTokenValue(rawPublicAccessValue: string) {
  const match = rawPublicAccessValue.match(/^(track|billing)_([^_]+)_/);

  if (!match) {
    return null;
  }

  const prefix = match[1] as CreateTokenInput["prefix"];
  return {
    prefix,
    entityId: match[2],
    scope: prefix === "track" ? "service_order_tracking" : "billing_summary",
    entityType: prefix === "track" ? "service_order" : "customer_portal",
  } as const;
}

export function hashPublicAccessToken(token: string) {
  return createHash("sha256")
    .update(`${config.publicAccessTokenPepper}:${token}`)
    .digest("hex");
}

export function createPublicAccessTokenHashPreview(token: string) {
  return `${hashPublicAccessToken(token).slice(0, 12)}...`;
}

export function buildPublicAccessUrl(path: string, token: string) {
  const baseUrl = config.appPublicUrl.replace(/\/$/, "");
  const embedsToken = path.includes("{token}");
  const pathWithToken = embedsToken ? path.replace("{token}", encodeURIComponent(token)) : path;
  const normalizedPath = pathWithToken.startsWith("/") ? pathWithToken : `/${pathWithToken}`;
  if (embedsToken) {
    return `${baseUrl}${normalizedPath}`;
  }
  return `${baseUrl}${normalizedPath}${normalizedPath.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
}

export function getPublicAccessTokenSecurityPolicy() {
  return {
    status: "public_access_token_policy_ready",
    rawTokenReturnedOnlyOnCreation: true,
    rawTokenPersisted: false,
    hashAlgorithm: "sha256_with_server_pepper",
    hashPersistedInProduction: true,
    requiresTenantScope: true,
    expiresAutomatically: true,
    supportsRevocation: true,
    auditsCreationAccessAndRevocation: true,
    customerIdentityRequiredForFinancialData: true,
    denySensitiveDataOnPublicLink: true,
    blockedPublicPayloads: [
      "assinatura do cliente",
      "relatorio tecnico completo",
      "fotos e anexos sensiveis",
      "dados financeiros",
      "notas internas",
    ],
  };
}
