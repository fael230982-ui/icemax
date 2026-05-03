import type { FastifyReply, FastifyRequest } from "fastify";
import { SignJWT, jwtVerify } from "jose";
import { config } from "./config";

export type AuthContext = {
  tenantId: string;
  userId: string;
  role: string;
};

const secret = new TextEncoder().encode(config.jwtSecret);

export async function signSessionToken(context: AuthContext) {
  return new SignJWT({
    tenantId: context.tenantId,
    role: context.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(context.userId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<AuthContext> {
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || typeof payload.tenantId !== "string" || typeof payload.role !== "string") {
    throw new Error("Token invalido.");
  }

  return {
    tenantId: payload.tenantId,
    userId: payload.sub,
    role: payload.role,
  };
}

export async function getAuthContext(request: FastifyRequest): Promise<AuthContext> {
  const authorization = request.headers.authorization;

  if (authorization?.startsWith("Bearer ")) {
    return verifySessionToken(authorization.slice("Bearer ".length));
  }

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
    const context = await getAuthContext(request);

    if (!roles.includes(context.role)) {
      return reply.code(403).send({ message: "Usuario sem permissao para esta acao." });
    }
  };
}
