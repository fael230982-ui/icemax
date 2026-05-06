# Gate De Observabilidade De Provedores

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Endpoint

`GET /integrations/provider-observability-gate`

## Objetivo

Definir os sinais minimos para liberar e manter provedores externos em operacao real com controle de saude, custo, falhas, webhooks e fallback manual.

## Provedores Monitorados

- E-mail transacional.
- WhatsApp Business.
- Google Maps Platform.
- OpenAI.

## Sinais Obrigatorios

- Taxa de entrega e falha.
- Custo diario e mensal por tenant.
- Latencia e atraso de webhook.
- Cota restante.
- Falhas de mascaramento de dados sensiveis.
- Taxa de fallback manual.

## Kill Switch

O sistema deve conseguir bloquear automaticamente novas tentativas quando custo, falhas, webhook ou privacidade sairem do limite definido.

## Bloqueios

- Ativar provedor sem dashboard de saude.
- Ativar provedor sem controle de custo.
- Ativar provedor sem monitor de webhook.
- Continuar envio apos kill switch.
- Reprocessar falha sem revisao manual.
