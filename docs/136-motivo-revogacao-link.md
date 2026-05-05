# Motivo De Revogacao De Link

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Registrar o motivo operacional de cada revogacao de link publico feita pelo console.

## Comportamento

- O console exige um motivo antes de enviar a revogacao.
- A API valida o motivo com tamanho minimo e maximo.
- O mock grava o motivo nos metadados do registro.
- O fluxo Prisma grava o motivo em `metadata.revocationReason`.
- A resposta da revogacao devolve `revocationReason` para conferencia imediata.
- A auditoria recebe o motivo junto com ID, escopo, entidade e resultado.

## Valor Operacional

Esse controle evita revogacoes sem contexto e prepara o sistema para auditoria real, suporte ao cliente, revisao de seguranca e historico administrativo por usuario.

## Proximos Passos

- Salvar usuario autenticado responsavel pela revogacao.
- Criar lista de motivos padronizados por tenant.
- Exigir confirmacao extra para links financeiros ativos.
