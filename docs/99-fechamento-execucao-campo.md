# Fechamento De Execucao Em Campo

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar o fechamento tecnico da OS antes da assinatura do cliente, garantindo que evidencias, medicoes, pecas, relatorio e governanca estejam prontos.

## Endpoint

`GET /dispatch/service-orders/:id/execution-closeout`

Consulta o pacote de fechamento de campo com parametros opcionais:

- `technicianUserId`: tecnico responsavel.
- `quoteId`: orcamento aprovado vinculado.

## Conteudo Do Pacote

- Status do fechamento.
- Bloqueios que impedem assinatura.
- Checklist de conclusao.
- Rascunho profissional de relatorio tecnico.
- Gate de assinatura do cliente.
- Proximas acoes para tecnico e gestor.
- Auditoria com idempotencia.

## Regras Operacionais

- A assinatura fica bloqueada enquanto houver evidencia obrigatoria pendente.
- A baixa de estoque precisa ser confirmada quando houver peca prevista.
- O relatorio deve passar por revisao de texto antes de ser apresentado ao cliente.
- O envio por e-mail so deve ocorrer depois da assinatura e da decisao sobre copia para o cliente.

## Painel Web

O console operacional recebeu a acao `Fechamento campo`, permitindo validar rapidamente o pacote de fechamento da OS piloto.

## Proximos Passos

- Criar aceite/assinatura do cliente conectado a este gate.
- Gerar comunicacao final por e-mail e opcionalmente copia ao cliente.
- Levar o mesmo fluxo para o app mobile offline.
