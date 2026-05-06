# Contador App Na Fila Compacta Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Mostrar quantas pendencias do recorte atual vieram do app tecnico antes do limite visual dos seis cards compactos.

## Entrega

- Contador `App tecnico` no cabecalho da fila compacta.
- Contagem baseada no recorte filtrado e ordenado.
- Indicacao preservada mesmo quando a fila compacta exibe apenas seis cards.
- Filtro rapido continua independente da tabela completa.

## Impacto Operacional

O gestor passa a saber se existem pedidos adicionais vindos do campo alem dos cards visiveis. Isso melhora decisao sobre priorizar o filtro `Apenas app tecnico` ou seguir analisando a fila geral.

## Proximo Avanco Recomendado

Adicionar contador de itens ocultos pela limitacao dos seis cards compactos.
