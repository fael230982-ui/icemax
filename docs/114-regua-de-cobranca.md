# Regua De Cobranca

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar uma regua de cobranca para contratos recorrentes, gerando pre-fila de comunicacao sem envio real enquanto provedores externos nao estiverem configurados.

## Endpoint

`GET /billing/collection-automation-board`

O endpoint retorna:

- recebiveis avaliados;
- mensagens prontas para e-mail, WhatsApp e aviso interno;
- itens bloqueados por revisao gerencial;
- preflight de provedor, LGPD e politica de cobranca;
- total de itens prontos e bloqueados.

## Regras

- Cobrancas criticas nao devem ir direto ao cliente.
- O canal interno continua liberado para avisar o gestor.
- WhatsApp depende de consentimento e chave oficial futura.
- E-mail depende de provedor configurado.
- A fila atual e mock e nao executa cobranca real.

## Painel Web

A secao `Regua de cobranca` aparece no dashboard financeiro e permite visualizar mensagens prontas, bloqueios e canais envolvidos.
