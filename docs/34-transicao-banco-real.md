# Transicao Para Banco Real

## Objetivo

Preparar a virada segura de dados mockados para Prisma/PostgreSQL sem depender de improviso quando o banco estiver disponivel.

## Endpoints

- `GET /database/cutover-plan`
- `GET /database/schema-summary`
- `GET /database/seed-plan`
- `GET /database/environment-checklist`

## Fluxo Recomendado

1. Configurar PostgreSQL local ou remoto.
2. Definir `DATABASE_URL`.
3. Executar `npm run db:generate`.
4. Executar `npm run db:migrate`.
5. Executar `npm run db:seed`.
6. Definir `API_DATA_SOURCE=prisma`.
7. Validar login local.
8. Executar `npm run validate`.

## Decisao Atual

Como Docker nao esta disponivel neste ambiente, a API continua em modo mock. O caminho para banco real fica documentado e exposto por API para homologacao.
