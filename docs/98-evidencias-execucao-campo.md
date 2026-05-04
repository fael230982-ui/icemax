# Evidencias De Execucao Em Campo

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Padronizar a coleta de evidencias durante a OS para reduzir retrabalho, melhorar relatorios e impedir conclusao sem provas minimas do servico executado.

## Entregas

- Endpoint `GET /dispatch/service-orders/:id/execution-evidence`.
- Estrutura para foto antes, durante e depois.
- Plano de medicoes tecnicas.
- Plano de pecas usadas e baixa de estoque.
- Gate de qualidade antes da conclusao.
- Botao `Evidencias campo` no painel web.

## Regras Operacionais

- Conclusao deve exigir fotos obrigatorias.
- Medicoes tecnicas devem ser registradas quando aplicaveis.
- Uso de pecas precisa de confirmacao antes da baixa.
- Texto tecnico deve ser preparado para revisao por IA.
- O historico do equipamento deve receber as evidencias relevantes.

## Valor Para Prazo

Este bloco antecipa a estrutura que o app mobile usara para coleta offline, evitando redesenho posterior da tela de execucao e do fechamento da OS.
