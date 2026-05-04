# Portal Publico De Aprovacao De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Criar a primeira experiencia publica para o cliente decidir sobre um orcamento enviado pela empresa.

## Rota

- Web: `/orcamentos/[token]`
- Exemplo esperado pelo backend: `https://app.icemax.local/orcamentos/quote_quote-001_...`

## Dados Exibidos

- Numero do orcamento.
- Cliente.
- OS vinculada.
- Equipamento.
- Local.
- Problema relatado.
- Itens, quantidades e valores.
- Total e validade.
- Condicoes comerciais.

## Decisoes Do Cliente

- Aprovar orcamento.
- Solicitar revisao.
- Recusar.

## Governanca

- A tela evita exibir margem, custo interno, notas internas e dados pessoais do tecnico.
- A decisao ainda esta visual; a proxima etapa e ligar os botoes ao endpoint publico de decisao por token.
- O fluxo final deve coletar nome, documento, e-mail e aceite dos termos antes de registrar a decisao.
