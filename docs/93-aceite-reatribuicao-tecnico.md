# Aceite E Reatribuicao De Tecnico

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Permitir que a atribuicao inteligente de uma OS seja confirmada pelo tecnico antes do deslocamento, mantendo alternativa operacional quando houver recusa ou necessidade de apoio.

## Entregas

- Endpoint `POST /dispatch/assignment-decision`.
- Schema para `accepted`, `rejected` e `needs_support`.
- Retorno com impacto no despacho, auditoria e proximas acoes.
- Plano de reatribuicao usando tecnico alternativo recomendado.
- Botao `Aceite tecnico` no painel web.

## Fluxo Operacional

1. Gestor consulta a fila de orcamentos aprovados.
2. Sistema recomenda tecnico, rota e prontidao.
3. Tecnico recebe a atribuicao no app ou painel operacional.
4. Tecnico aceita, recusa ou pede apoio.
5. Aceite libera aviso ao cliente e acompanhamento de rota.
6. Recusa aciona tecnico alternativo, recalculo de rota e nova prontidao.
7. Pedido de apoio mantem o tecnico atribuido, mas exige revisao do gestor.

## Regras De Produto

- A OS nao deve iniciar deslocamento sem aceite ou aprovacao manual do gestor.
- Recusas devem preservar motivo para auditoria e melhoria da escala.
- Reatribuicao deve considerar score, distancia, disponibilidade e prontidao.
- Cliente deve ser avisado quando houver impacto na janela combinada.
