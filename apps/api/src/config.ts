export const config = {
  port: Number(process.env.PORT ?? 3333),
  host: process.env.HOST ?? "0.0.0.0",
  dataSource: process.env.API_DATA_SOURCE ?? "mock",
  defaultTenantId: process.env.DEFAULT_TENANT_ID ?? "tenant-icemax",
};

export function isPrismaEnabled() {
  return config.dataSource === "prisma";
}
