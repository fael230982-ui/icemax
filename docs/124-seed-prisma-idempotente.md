# Seed Prisma Idempotente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

O seed Prisma da ICEMAX deve poder ser executado repetidas vezes durante desenvolvimento, homologacao e preparacao de ambiente sem duplicar dados base.

## Mudanca

O arquivo `packages/database/prisma/seed.ts` passou a usar `upsert` com IDs deterministicos para os principais registros:

- tenant ICEMAX;
- usuario dono;
- tecnico;
- cliente;
- endereco;
- equipamento;
- ordem de servico;
- contrato;
- visita de contrato;
- peca;
- local de estoque;
- saldo inicial;
- checklist;
- itens de checklist;
- manual;
- integracoes pendentes.

## Endpoint Relacionado

`GET /database/seed-plan`

O endpoint agora informa:

- `idempotent: true`;
- estrategia de `upsert`;
- IDs deterministicos principais;
- login de desenvolvimento;
- dados criados pelo seed.

## Regras

1. O seed nao deve publicar segredos reais.
2. Senha de desenvolvimento deve continuar documentada como uso local.
3. Dados fixos devem usar IDs deterministicos para evitar duplicidade.
4. O seed deve continuar seguro para execucoes repetidas antes de testes e homologacao.
