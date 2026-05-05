# Validacao De Link Publico

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Adicionar a primeira barreira real de abertura para links publicos enviados ao cliente, evitando que acompanhamento de OS e resumo de contratos sejam tratados apenas como URLs informativas.

## Endpoint

`GET /public/customer-portal/tokens/:token/validate?scope=service_order_tracking`

Escopos aceitos:

- `service_order_tracking`
- `billing_summary`

## Comportamento

- Em modo mock, a API valida o formato do token, escopo e entidade inferida.
- Em modo Prisma, a API consulta `PublicAccessToken` por hash e tenant.
- Token revogado retorna invalido.
- Token expirado retorna invalido.
- Token de outro escopo retorna invalido.
- Toda tentativa registra auditoria com escopo, resultado e motivo.

## Protecoes

- O token cru nao e persistido.
- A validacao sempre exige escopo esperado.
- O acesso e limitado ao tenant atual.
- Dados financeiros permanecem bloqueados para link publico sem confirmacao de identidade em producao.

## Proximos Passos

- Conectar a pagina web de acompanhamento ao endpoint de validacao.
- Conectar a pagina do portal financeiro ao endpoint de validacao.
- Adicionar rate limit por IP e token.
- Criar tela administrativa de revogacao.
- Registrar `lastAccessedAt` em toda abertura real com Prisma.
