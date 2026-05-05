# Health Score Do Tenant Whitelabel

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento descreve o bloco de health score dos primeiros 30 dias do tenant whitelabel. O objetivo e impedir que a ICEMAX escale para outra empresa antes de medir estabilidade real, adocao operacional, custos e impacto no cliente.

## Endpoint

`GET /platform/mobile-offline-escalations/whitelabel-tenant-health-score`

O endpoint retorna um painel executivo com score medio, indicadores bloqueados, pontos de atencao, decisao atual e a lista de acoes proibidas enquanto o primeiro tenant estiver em hypercare.

## Indicadores

- Estabilidade do reenvio offline.
- Aderencia da equipe tecnica.
- Comunicacao com cliente.
- Controle de custos de provedores.
- Suporte e incidentes.
- Revisao executiva do dono.

## Regra De Decisao

A escala para um segundo tenant permanece bloqueada enquanto qualquer um destes pontos estiver pendente:

- Revisao D1 sem incidente critico.
- Revisao da Semana 1 com adocao da equipe validada.
- Revisao D30 com custos reais e impacto no cliente.
- Aprovacao formal de RAFAEL DA SILVA BEZEERA.

## Acoes Bloqueadas

- Ativar segundo tenant.
- Ofertar whitelabel publicamente.
- Desativar revisao diaria de saude.
- Escalar sem revisao executiva do dono.

## Uso Operacional

Este health score deve ser usado nas reunioes D1, Semana 1 e D30. Quando provedores reais, rotas e operacao estiverem conectados, os indicadores devem receber dados reais antes de qualquer decisao de escala.
