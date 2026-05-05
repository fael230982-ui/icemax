# Revogacao De Link Por Registro

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir que o painel administrativo revogue links publicos usando o ID do registro listado no inventario, sem exigir que a equipe visualize ou cole o token cru.

## Endpoint

`POST /customer-portal/public-token-records/:id/revoke`

## Por Que Isso Importa

Revogar por token cru e util para fluxos tecnicos, mas nao e ideal para operacao. A equipe deve trabalhar com registros auditaveis, escopo, entidade e status, mantendo o token real fora da interface administrativa.

## Comportamento

- Procura o token pelo ID do registro e tenant atual.
- Se estiver ativo, grava revogacao.
- Se ja estiver revogado, retorna estado idempotente.
- Se nao encontrar, retorna bloqueio.
- Registra auditoria com ID, entidade, escopo e resultado.

## Protecoes

- O token cru nao e necessario.
- A resposta retorna apenas preview do hash.
- A revogacao fica presa ao tenant.
- A acao e auditada separadamente como `customer_portal.public_token_record_revoked`.

## Proximos Passos

- Adicionar botao de revogacao na tabela visual do console.
- Exigir motivo operacional da revogacao.
- Exibir usuario responsavel quando autenticacao estiver ativa em producao.
- Enviar novo link ao cliente apos revogacao quando solicitado.
