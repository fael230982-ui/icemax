# Portal Financeiro Do Cliente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Adicionar ao portal whitelabel uma visao simples para o cliente consultar contratos, mensalidades previstas, equipamentos cobertos e proximas visitas.

## Endpoint

`GET /customer-portal/:tenantSlug/billing-summary`

O endpoint retorna:

- dados publicos do tenant;
- quantidade de contratos;
- total mensal previsto;
- equipamentos cobertos;
- proxima visita por contrato;
- proximo vencimento e valor;
- regras de privacidade.

## Regras De Privacidade

O portal do cliente nao deve exibir:

- margem interna;
- politica de cobranca;
- observacoes administrativas;
- score comercial;
- bloqueios internos de inadimplencia.

Em producao, esta area deve exigir identificacao segura do cliente antes de liberar dados reais.

## Painel Web

A pagina `/portal/[tenantSlug]` passou a incluir o componente `PortalBillingSummary`, mantendo fallback local quando a API nao esta disponivel.
