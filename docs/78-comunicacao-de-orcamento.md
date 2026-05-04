# Comunicacao De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Preparar a comunicacao do link publico de aprovacao de orcamento por e-mail, WhatsApp e aviso interno.

## Endpoints

- `GET /quotes/:id/communication-package`
- `POST /quotes/:id/communication-queue`

## Canais

- E-mail: assunto e corpo com link publico de aprovacao.
- WhatsApp: mensagem curta com link publico.
- Interno: aviso para acompanhamento comercial e operacional.

## Governanca

- Envio real depende das chaves futuras de e-mail e Meta WhatsApp.
- WhatsApp deve respeitar consentimento do cliente.
- A fila usa idempotencia por orcamento, canal e template.
- Dados internos de margem permanecem ocultos.

## Proximo Encaixe

Persistir a fila no banco real e criar processador de envio quando os provedores externos forem configurados.
