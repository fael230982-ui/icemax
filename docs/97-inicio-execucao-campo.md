# Inicio De Execucao Em Campo

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Garantir que o tecnico so inicie a intervencao depois de check-in, evidencias obrigatorias, escopo aprovado e checklist inicial.

## Entregas

- Endpoint `GET /dispatch/service-orders/:id/execution-start`.
- Pacote de evidencias obrigatorias.
- Validacao de check-in antes da intervencao.
- Script de abordagem do tecnico ao responsavel no local.
- Gate gerencial para override com justificativa.
- Botao `Inicio execucao` no painel web.

## Regras Operacionais

- Nao iniciar atendimento sem check-in valido.
- Registrar foto antes da intervencao.
- Conferir equipamento por QR Code ou placa.
- Conferir escopo aprovado antes de executar.
- Itens fora do escopo exigem novo orcamento ou autorizacao.

## Valor Para Prazo

Este bloco antecipa regras criticas do app mobile e reduz retrabalho na tela de execucao, porque define claramente o que deve acontecer entre chegada e checklist.
