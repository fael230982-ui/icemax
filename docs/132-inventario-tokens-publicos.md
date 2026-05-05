# Inventario De Tokens Publicos

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Dar visibilidade operacional aos links publicos emitidos para clientes, permitindo suporte, auditoria, revogacao e preparacao de uma tela administrativa no painel web.

## Endpoint

`GET /customer-portal/public-tokens`

Filtros opcionais:

- `scope`: `service_order_tracking` ou `billing_summary`
- `entityType`: `service_order` ou `customer_portal`
- `entityId`: ID da OS, portal ou entidade vinculada
- `status`: `active`, `revoked`, `expired` ou `all`

## Dados Retornados

- ID tecnico do registro.
- Preview do hash do token.
- Escopo.
- Tipo e ID da entidade.
- Status.
- Expiracao.
- Data de revogacao quando houver.
- Ultimo acesso quando houver.
- Data de criacao.

## Protecoes

- O token cru nao e listado.
- O mock tambem armazena apenas preview de hash.
- O endpoint registra auditoria de consulta.
- O retorno inclui resumo por status.
- A listagem e limitada a 100 registros no Prisma.

## Uso Operacional

- Encontrar links ativos de uma OS.
- Conferir se um link financeiro foi revogado.
- Investigar acesso indevido.
- Preparar suporte ao cliente quando ele pedir novo link.
- Alimentar uma futura tela administrativa de seguranca.

## Proximos Passos

- Criar painel web para listar e revogar tokens.
- Adicionar motivo obrigatorio de revogacao.
- Registrar usuario responsavel pela revogacao.
- Adicionar busca por cliente e e-mail.
