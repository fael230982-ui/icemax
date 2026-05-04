# Ativacao De Orcamento Aprovado

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Preparar a liberacao operacional quando um orcamento for aprovado pelo cliente.

## Endpoint

- `POST /quotes/:id/approval-activation`

## Saidas

- Permissao ou bloqueio de ativacao.
- Status alvo da OS.
- Reserva de pecas prevista.
- Orientacao de despacho e prontidao.
- Mensagens para cliente, tecnico e operacao.
- Auditoria e idempotencia.

## Regras

- Orcamento aprovado retorna `activation_ready`.
- Orcamento pendente, recusado ou em revisao retorna `activation_blocked`.
- A execucao nao deve ser liberada sem aceite do cliente.

## Proximo Encaixe

Persistir a ativacao no banco real e disparar automaticamente reserva de pecas e preparo da visita.
