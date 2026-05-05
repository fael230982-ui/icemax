# Dry-Run Do Reenvio Assistido Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir testar o fluxo de reenvio assistido de uma pendencia offline sem disparar envio real para a API operacional.

## O Que Foi Implementado

- Criado endpoint `POST /platform/mobile-offline-escalations/:recordId/assisted-retry/dry-run`.
- O dry-run simula carregamento da acao original, validacao de idempotencia, checagem da OS, envio e auditoria.
- O envio real permanece explicitamente bloqueado.
- O resultado informa que a acao seria enviada, mas nao foi enviada.
- O console web ganhou acao `Simular` por pendencia bloqueada.
- Teste automatizado cobre status `dry_run_completed`, bloqueio de envio real e resultado sem envio.

## Valor Operacional

Esse passo permite validar governanca, auditoria e idempotencia antes de ativar reenvio real em producao. E uma camada importante para evitar duplicidade em assinatura, evidencia, estoque e fechamento de OS.

## Segurança

- Nenhum segredo, chave, token ou credencial foi adicionado.
- O dry-run nao envia dados reais.
- A execucao real continua bloqueada ate existir ambiente, regra de permissao e auditoria persistente.
