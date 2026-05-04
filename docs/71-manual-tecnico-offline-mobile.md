# Manual Tecnico Offline No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Garantir que o tecnico consiga consultar o manual do equipamento mesmo sem internet e que a consulta fique registrada no historico da OS.

## App Mobile

A tela de campo passa a exibir:

- manual tecnico provavel;
- necessidade de cache antes do deslocamento;
- orientacao de seguranca;
- conferencia por QR Code ou etiqueta do equipamento.

## Acao Offline

O app cria uma acao pendente para `POST /service-orders/:id/notes` registrando que o manual foi consultado e cacheado no aparelho.

## Proximos Passos

- baixar PDF real no armazenamento local;
- registrar tempo de abertura do manual;
- vincular busca por codigo de erro;
- alertar gestor quando nao houver manual para o modelo encontrado.
