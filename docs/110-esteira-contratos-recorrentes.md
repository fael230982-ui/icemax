# 110 - Esteira De Contratos Recorrentes

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Criar uma visao comercial para converter atendimentos avulsos em contratos recorrentes de manutencao, higienizacao e visitas preventivas.

## Endpoint

`GET /contracts/opportunity-pipeline`

## O que a esteira mostra

- Oportunidades geradas a partir das OS.
- Score comercial por cliente/equipamento.
- Plano recomendado: trimestral, quadrimestral ou semestral.
- Receita mensal e anual estimada.
- Riscos de abordagem.
- Data sugerida para o proximo contato.
- Proxima acao comercial.

## Painel web

O painel principal ganhou a secao `Esteira de contratos recorrentes`, com filtros por etapa e resumo de receita mensal estimada.

## Governanca

A esteira oculta margem interna e exige aprovacao humana antes de enviar proposta. O objetivo e apoiar o vendedor/gestor, nao enviar proposta automaticamente.
