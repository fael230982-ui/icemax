# Gate De Pre-Release

## Objetivo

Evitar liberar homologacao externa antes de requisitos minimos estarem claros.

## Endpoint

- `GET /platform/pre-release-gate`

## Verificacoes

- fonte de dados;
- `DATABASE_URL`;
- `JWT_SECRET`;
- integracoes externas;
- validacao tecnica;
- PDFs de documentacao.

## Decisao Atual

O gate deve permanecer bloqueado enquanto o projeto estiver em modo mock e sem banco real. Isso nao impede desenvolvimento, mas impede homologacao externa sem preparacao.
