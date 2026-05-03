import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "./config";

export type AuthContext = {
  tenantId: string;
  userId: string;
  role: string;
};

export function getAuthContext(request: FastifyRequest): AuthContext {
  const tenantId = request.headers["x-tenant-id"];
  const userId = request.headers["x-user-id"];
  const role = request.headers["x-user-role"];

  return {
    tenantId: typeof tenantId === "string" ? tenantId : config.defaultTenantId,
    userId: typeof userId === "string" ? userId : "dev-user",
    role: typeof role === "string" ? role : "owner",
  };
}

export function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const context = getAuthContext(request);

    if (!roles.includes(context.role)) {
      return reply.code(403).send({ message: "Usuario sem permissao para esta acao." });
    }
  };
}
