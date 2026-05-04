# API Publica De Decisao De Orcamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir que um cliente consulte e decida um orcamento por token publico, sem precisar acessar o painel interno da empresa.

## Endpoints

- `GET /public/quotes/:token`
- `PATCH /public/quotes/:token/decision`

## Payload De Decisao

```json
{
  "decision": "approved",
  "customerName": "Cliente Responsavel",
  "customerDocument": "opcional",
  "customerEmail": "cliente@empresa.com",
  "acceptedTerms": true,
  "reason": "opcional"
}
```

## Regras

- `approved` exige `acceptedTerms: true`.
- `revision_requested` e convertido em revisao comercial.
- Links invalidos retornam erro de token invalido ou expirado.
- O retorno publico nao deve expor margem, custos internos ou notas privadas.

## Proximo Encaixe

A rota web `/orcamentos/[token]` deve chamar estes endpoints para buscar dados reais e registrar a decisao do cliente.
