# Smoke Test Prisma

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

O smoke test Prisma verifica se o banco real possui os dados minimos para uma homologacao operacional da ICEMAX.

## Endpoint

`GET /database/prisma-smoke-test`

## Comportamento

Quando a API esta em modo mock, o endpoint retorna `skipped` e informa os pre-requisitos:

- `DATABASE_URL`;
- `API_DATA_SOURCE=prisma`;
- `npm run db:migrate`;
- `npm run db:seed`.

Quando a API esta em modo Prisma, o endpoint consulta contagens por `DEFAULT_TENANT_ID` nos dominios:

- tenant;
- usuarios;
- clientes;
- equipamentos;
- ordens de servico;
- contratos;
- pecas;
- locais de estoque;
- checklists;
- manuais;
- integracoes.

## Criterio

O smoke test passa quando todos os dominios minimos retornam dados. Se algum dominio vier vazio, o resultado fica em `attention` e recomenda executar o seed idempotente antes de homologar.
