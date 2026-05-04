# 55 - Fila De Comunicacao

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar o envio profissional de e-mail, WhatsApp e avisos internos sem depender ainda das chaves reais dos provedores. A fila permite validar regras, idempotencia, tentativas e bloqueios antes da integracao externa.

## Entregas

- Endpoint `POST /service-orders/:id/communication-queue`.
- Endpoint `POST /contracts/:id/communication-queue`.
- Itens de fila com canal, provedor pendente, destinatario, template, assunto, corpo, prioridade e status.
- Chave de idempotencia por origem, canal e template.
- Preflight de LGPD, anexos, contrato, cobranca e credenciais externas.
- Console web com botoes `Fila comunicacao OS` e `Fila comunicacao contrato`.
- Testes automatizados cobrindo criacao de fila, idempotencia e pendencia de chave externa.

## Comportamento

Cada pacote de comunicacao vira uma lista de itens `queued_mock`. Nenhum envio real e executado nesta fase. Quando as chaves de e-mail e WhatsApp forem configuradas, a mesma estrutura podera ser persistida e processada por jobs.

## Governanca

- WhatsApp deve respeitar consentimento do cliente.
- E-mail de OS deve considerar copia opcional ao cliente.
- Itens usam idempotencia para reduzir duplicidade de envio.
- Respostas de provedores devem ser gravadas em auditoria.
- Falhas devem respeitar limite de tentativas.

## Proximos Passos

- Persistir a fila no PostgreSQL.
- Criar worker de processamento assincrono.
- Integrar provedor de e-mail.
- Integrar WhatsApp Business.
- Exibir historico de envios na OS e no contrato.
