# Board Gerencial De Orcamentos

Autor: RAFAEL DA SILVA BEZEERA  
E-mail: adm.rcsolutions@gmail.com  
Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

O board gerencial de orcamentos organiza a fila comercial e operacional de aprovacao. Ele separa orcamentos pendentes de decisao, aprovados para execucao e casos que precisam de revisao comercial.

## Endpoint

`GET /quotes/approval-board`

O retorno inclui:

- Resumo total de orcamentos, pendentes, aprovados e em revisao.
- Valor total em pipeline.
- Lanes para acompanhamento visual.
- SLA por orcamento.
- Dias ate vencimento.
- Nivel de risco.
- Canal recomendado de comunicacao.
- Alertas para vencimento, aprovacao pronta e revisao.
- Governanca de auditoria e privacidade.

## Uso No Console Web

O botao `Board orcamentos` consulta o board pelo console operacional. Essa acao serve para validar rapidamente o fluxo antes de criar uma tela dedicada com filtros, colunas e indicadores visuais.

## Regras De Gestao

- Orcamentos aprovados devem ser ativados rapidamente para despacho.
- Orcamentos perto do vencimento devem gerar lembrete por canal autorizado.
- Orcamentos recusados ou com revisao devem voltar ao comercial.
- Margem interna e custos de compra nao aparecem no board de atendimento.

## Evolucao Recomendada

- Persistir eventos reais de envio, abertura e decisao.
- Criar filtros por vendedor, tecnico, cliente, prioridade e vencimento.
- Gerar alertas automaticos no WhatsApp interno e e-mail do gestor.
- Vincular o board ao financeiro para prever receita aprovada e pendente.
