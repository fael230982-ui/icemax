import argon2 from "argon2";
import type { FastifyInstance } from "fastify";
import { getAuthContext, signSessionToken } from "../auth";
import { isPrismaEnabled } from "../config";
import { findUserById, findUserForLogin } from "../repositories/auth-repository";
import { loginSchema, parseBody } from "../schemas";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    if (!isPrismaEnabled()) {
      return reply.code(400).send({ message: "Login real exige API_DATA_SOURCE=prisma." });
    }

    const input = parseBody(loginSchema, request.body);
    const user = await findUserForLogin(input);

    if (!user) {
      return reply.code(401).send({ message: "Credenciais invalidas." });
    }

    const valid = await argon2.verify(user.passwordHash, input.password).catch(() => false);

    if (!valid) {
      return reply.code(401).send({ message: "Credenciais invalidas." });
    }

    const token = await signSessionToken({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
      },
    };
  });

  app.get("/auth/me", async (request, reply) => {
    const context = await getAuthContext(request);

    if (!isPrismaEnabled()) {
      return {
        context,
        mode: "mock",
      };
    }

    const user = await findUserById(context.tenantId, context.userId);

    if (!user) {
      return reply.code(401).send({ message: "Sessao invalida." });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
      },
    };
  });
}
