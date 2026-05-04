# Pecas Reservadas No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco leva a reserva operacional de pecas para o app mobile do tecnico.

O tecnico passa a visualizar os itens provaveis antes de sair e pode salvar uma confirmacao offline de carregamento.

## Mobile

Foi adicionada a secao `Pecas reservadas` com:

- R410A;
- capacitor 45uF;
- movimentacao planejada;
- orientacao de compra/reposicao.

## Acao Offline

A funcao `createPartsLoadAckAction` cria uma acao local para o endpoint:

- `POST /service-orders/:id/parts-reservation`

O payload inclui:

- tecnico;
- origem;
- destino;
- SKUs carregados;
- horario local da confirmacao.

## Proximos Passos

- Permitir check individual por item no app.
- Validar leitura de QR ou codigo da peca antes do carregamento.
- Bloquear conclusao da OS se a baixa de peca obrigatoria estiver pendente.
- Sincronizar consumo real com estoque e compra automatica.
