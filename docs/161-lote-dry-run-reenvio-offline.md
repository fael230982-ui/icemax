# Lote Dry-Run Do Reenvio Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Preparar uma fila controlada de dry-run para pendencias offline, com ordem, limite, pre-checks e bloqueios explicitos antes de qualquer execucao real.

## O Que Foi Implementado

- Criado endpoint `GET /platform/mobile-offline-escalations/dry-run-batch`.
- O lote seleciona candidatos priorizados a partir do plano de acao.
- Cada candidato recebe sequencia, responsavel, score, chave de idempotencia e pre-checks obrigatorios.
- O lote limita execucao paralela, exige inicio humano e recomenda parar no primeiro erro.
- Console web ganhou botao `Lote dry-run offline`.
- Teste automatizado cobre candidatos, bloqueio de execucao real e dry-run exclusivo.

## Valor Operacional

O gestor passa a conseguir organizar varios dry-runs sem transformar isso em automacao perigosa. A equipe ganha previsibilidade de ordem, limite e auditoria, mantendo o controle humano antes de qualquer avancar para producao.

## Seguranca

- Nenhum segredo, chave, token ou credencial foi adicionado.
- O lote nao executa reenvio automaticamente.
- A execucao real e o loop automatico permanecem bloqueados.
- Cada candidato exige idempotencia, trilha de auditoria e pre-checks antes do dry-run.
