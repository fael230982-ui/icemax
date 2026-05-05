export const config = {
  port: Number(process.env.PORT ?? 3333),
  host: process.env.HOST ?? "0.0.0.0",
  dataSource: process.env.API_DATA_SOURCE ?? "mock",
  defaultTenantId: process.env.DEFAULT_TENANT_ID ?? "tenant-icemax",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-before-production",
  appPublicUrl: process.env.APP_PUBLIC_URL ?? "https://app.icemax.local",
  publicAccessTokenPepper: process.env.PUBLIC_ACCESS_TOKEN_PEPPER ?? "dev-public-access-token-pepper",
};

export function isPrismaEnabled() {
  return config.dataSource === "prisma";
}
