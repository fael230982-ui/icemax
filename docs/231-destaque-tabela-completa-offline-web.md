# Destaque Da Tabela Completa Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Destacar visualmente a tabela completa de pendencias offline quando o gestor navegar pelo atalho de risco oculto critico.

## Entrega

- Destaque visual aplicado ao elemento de destino `mobile-offline-full-table`.
- Uso de CSS `:target` para evitar estado adicional no painel.
- Ajuste de `scroll-margin-top` para posicionamento confortavel na tela.
- Estilo alinhado ao alerta de risco critico da fila compacta.

## Impacto Operacional

O gestor entende imediatamente que chegou na tabela completa correta apos sair da fila compacta, reduzindo perda de contexto durante a analise.

## Proximo Avanco Recomendado

Adicionar um filtro rapido na tabela completa para exibir primeiro os itens de maior severidade.
