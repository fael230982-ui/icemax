# Pacote De Aprovacao De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Preparar o envio de orcamentos para aprovacao do cliente por link publico, mantendo rastreabilidade e separando informacoes comerciais internas do que o cliente deve enxergar.

## Endpoint

`GET /quotes/:id/approval-package`

## Conteudo

- token e URL publica;
- validade do link;
- resumo financeiro sem margem interna;
- opcoes de aprovar ou recusar;
- mensagens prontas para WhatsApp e e-mail;
- endpoint de decisao;
- proximas acoes operacionais.

## Uso Operacional

O painel web consulta o pacote e mostra o conteudo pronto para envio. Quando o cliente aprovar, o sistema usa `PATCH /quotes/:id/decision` para registrar a decisao e liberar execucao, reserva de pecas e agenda.

## Proximos Passos

- criar pagina publica real de orcamento;
- registrar IP, user-agent e aceite formal;
- expirar links automaticamente;
- acionar fila de comunicacao quando WhatsApp e e-mail estiverem configurados.
