# Carregamento Publico De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Fazer a pagina publica de orcamento consumir o endpoint publico por token, mantendo fallback local para ambiente de desenvolvimento.

## Fluxo

1. A rota recebe `/orcamentos/[token]`.
2. O servidor web tenta consultar `GET /public/quotes/:token`.
3. Se a API responder, a tela usa cliente, OS, validade, total e itens retornados.
4. Se a API estiver offline, a tela usa dados de demonstracao seguros.

## Dados Mapeados

- `quoteNumber` para numero do orcamento.
- `serviceOrderId` para OS vinculada.
- `customer` para cliente.
- `financialSummary.formattedTotal` para total.
- `financialSummary.items` para composicao do orcamento.
- `expiresAt` para validade.

## Observacao

A busca real depende de `NEXT_PUBLIC_API_URL` apontando para a API publicada ou para `http://localhost:3333` em desenvolvimento.
