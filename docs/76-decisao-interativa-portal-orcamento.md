# Decisao Interativa No Portal De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Transformar o portal publico de orcamento em uma tela capaz de registrar a decisao do cliente.

## Experiencia

- O cliente escolhe aprovar, solicitar revisao ou recusar.
- O responsavel informa nome, documento e e-mail.
- A aprovacao exige aceite dos termos comerciais.
- O formulario exibe retorno de carregamento, sucesso ou erro.

## Integracao

- Cliente web: `icemaxApi.publicQuoteDecision(token, payload)`
- Endpoint: `PATCH /public/quotes/:token/decision`

## Proximo Passo

Buscar os dados do orcamento pela API publica no carregamento da pagina e substituir os dados estaticos do prototipo.
