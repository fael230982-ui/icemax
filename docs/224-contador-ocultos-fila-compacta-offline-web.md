# Contador De Itens Ocultos Na Fila Compacta

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Mostrar ao gestor quantos itens do recorte atual ficaram fora dos seis cards compactos.

## Entrega

- Contador `Ocultas` no cabecalho da fila compacta.
- Contagem calculada antes do limite visual de seis cards.
- Respeito ao filtro `Apenas app tecnico`.
- Indicacao para apoiar a decisao de abrir a tabela completa.

## Impacto Operacional

O gestor evita interpretar a fila compacta como lista completa. Quando houver itens ocultos, ele sabe que a tabela detalhada ainda deve ser consultada para tratar o restante da fila.

## Proximo Avanco Recomendado

Adicionar destaque visual quando existirem itens ocultos acima de zero.
