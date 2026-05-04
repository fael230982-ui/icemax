# Linha Do Tempo De Orcamento

Autor: RAFAEL DA SILVA BEZEERA  
E-mail: adm.rcsolutions@gmail.com  
Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

A linha do tempo de orcamento centraliza a rastreabilidade do fluxo comercial ate a liberacao operacional. Ela ajuda a equipe a entender se o link foi preparado, se a comunicacao foi enviada, se o cliente acessou, se houve decisao e se a execucao foi liberada.

## Endpoint

`GET /quotes/:id/approval-timeline`

O retorno inclui:

- Identificacao do orcamento, cliente, OS vinculada e tenant.
- Resumo de envio, abertura, decisao, aprovacao, recusa e ativacao.
- Eventos ordenados com ator, data simulada, status e detalhe.
- Metricas de eventos concluidos, pendentes, bloqueados e proximo evento.
- Governanca de auditoria, LGPD e ocultacao de margem interna.
- Proximas acoes para comercial, operacao e despacho.

## Eventos Iniciais

- `quote.created`: orcamento criado.
- `quote.approval_package_created`: link publico e termos preparados.
- `communication.quote_queue_created`: comunicacao enfileirada.
- `quote.public_link_opened`: abertura do portal publico pelo cliente.
- `quote.public_decision_recorded`: aprovacao, recusa ou revisao.
- `quote.approval_activation_prepared`: liberacao operacional apos aprovacao.

## Uso Operacional

No console web, a acao `Timeline orcamento` consulta o orcamento aprovado de demonstracao (`quote-002`). Em ambiente real, a tela deve permitir selecionar qualquer orcamento e exibir essa timeline ao lado das mensagens, do handoff e da ativacao.

## Evolucao Recomendada

- Persistir eventos imutaveis no banco de auditoria.
- Registrar abertura real do link publico com IP, user-agent e horario.
- Conectar entregas reais de e-mail e WhatsApp.
- Exibir a timeline tambem no app mobile quando o tecnico receber uma OS liberada por orcamento.
- Criar alertas quando o cliente nao abrir o link ou quando a validade estiver proxima.
