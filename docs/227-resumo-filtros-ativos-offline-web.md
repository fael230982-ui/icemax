# Resumo De Filtros Ativos Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Indicar claramente quando a fila diaria compacta offline esta em visao recortada por filtros.

## Entrega

- Faixa `Filtros ativos` exibida apenas quando ha recorte aplicado.
- Resumo de origem, prioridade, responsavel, tecnico e ordenacao.
- Inclusao do modo `Apenas app tecnico` no resumo.
- Estado padrao sem aviso para manter a tela limpa.

## Impacto Operacional

Evita que o gestor interprete uma fila filtrada como volume total de pendencias, reduzindo risco de decisao incompleta no comando diario.

## Proximo Avanco Recomendado

Adicionar indicador de percentual visivel da fila compacta em relacao ao total filtrado.
