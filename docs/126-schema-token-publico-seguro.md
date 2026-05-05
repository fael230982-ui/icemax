# Schema De Token Publico Seguro

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Preparar a plataforma ICEMAX para substituir tokens mock de portal, acompanhamento, financeiro e orcamentos por tokens persistidos com hash.

## Modelo Prisma

`PublicAccessToken`

Campos principais:

- `tenantId`;
- `tokenHash`;
- `scope`;
- `entityType`;
- `entityId`;
- `customerId`;
- `customerEmail`;
- `customerPhone`;
- `expiresAt`;
- `revokedAt`;
- `lastAccessedAt`;
- `metadata`;
- `createdByUserId`.

## Regras

1. Token bruto nunca deve ser salvo no banco.
2. Apenas `tokenHash` deve ser persistido.
3. Todo token deve ter escopo, entidade, tenant e expiracao.
4. Revogacao deve preencher `revokedAt`.
5. Acesso real deve atualizar `lastAccessedAt` e registrar auditoria.

## Seed

O seed idempotente cria um token de desenvolvimento com hash nao secreto: `dev-public-token-hash-not-secret`.

Esse valor nao e uma credencial; serve apenas para smoke test de estrutura.
