# Politica De Acesso Do Portal

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Definir uma politica clara para separar o que o portal do cliente pode expor publicamente, o que depende de link com token e o que exige identidade validada antes de dados sensiveis.

## Endpoint

`GET /customer-portal/:tenantSlug/access-policy`

O endpoint retorna:

- zonas do portal;
- nivel de acesso por zona;
- dados permitidos;
- dados bloqueados;
- exigencia de identidade;
- regras de enforcement;
- checks obrigatorios antes de producao.

## Zonas

- `service_order_request`: formulario publico de solicitacao.
- `service_order_tracking`: acompanhamento por link opaco com expiracao.
- `billing_summary`: area financeira com token e identidade em producao.

## Regras De Producao

- Negar por padrao quando a permissao nao estiver clara.
- Auditar todo acesso sensivel.
- Persistir tokens somente como hash.
- Isolar dados por tenant.
- Validar identidade do cliente antes de mostrar dados financeiros reais.

## Portal Web

O componente `PortalBillingSummary` passou a exibir a politica resumida, para deixar visivel a separacao entre acesso publico, token temporario e area segura.
