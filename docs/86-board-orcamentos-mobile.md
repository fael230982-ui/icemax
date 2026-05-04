# Board De Orcamentos No Mobile

Autor: RAFAEL DA SILVA BEZEERA  
E-mail: adm.rcsolutions@gmail.com  
Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

O app mobile agora exibe um resumo do board de orcamentos para uso em campo. O tecnico consegue identificar rapidamente se existe orcamento aprovado para execucao, pendente de decisao ou com risco operacional.

## Experiencia No App

A secao `Board de orcamentos` mostra:

- Orcamento aprovado e liberado para a OS.
- Orcamento aguardando decisao do cliente.
- SLA de lembrete antes do vencimento.
- Risco de executar fora do escopo aprovado.
- Canal de comunicacao autorizado.
- Direcionamento para gestor, despacho ou comercial.

## Sincronizacao Offline

O botao `Board orcamentos` registra uma nota offline na OS. Isso cria rastreabilidade de que o tecnico consultou o board antes de executar ou prosseguir com o atendimento.

## Evolucao Recomendada

- Consumir `GET /quotes/approval-board` no app quando houver conexao.
- Fazer cache do board por tecnico e por dia.
- Bloquear execucao mobile quando a OS depender de orcamento pendente.
- Alertar o tecnico quando houver divergencia entre OS e escopo aprovado.
