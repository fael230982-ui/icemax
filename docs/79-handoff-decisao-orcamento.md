# Handoff De Decisao De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Traduzir a decisao do cliente em proximas acoes para operacao, estoque, tecnico e comercial.

## Endpoint

- `GET /quotes/:id/decision-handoff`

## Saidas

- Status operacional do handoff.
- Resumo da decisao.
- Plano de execucao.
- Impacto em estoque.
- Mensagens internas, tecnicas e para o cliente.
- Regras de governanca.

## Regras

- Orcamento aprovado libera execucao, reserva de pecas e despacho.
- Orcamento recusado ou em revisao bloqueia execucao e retorna ao comercial.
- Orcamento pendente mantem a OS aguardando decisao do cliente.

## Proximo Encaixe

Acionar automaticamente reserva de pecas e despacho quando a decisao publica registrar aprovacao.
