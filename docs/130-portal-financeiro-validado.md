# Portal Financeiro Validado

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Proteger o resumo financeiro do portal do cliente para que contratos, valores, proximos vencimentos e equipamentos cobertos nao sejam exibidos em acesso publico sem token valido.

## Fluxo

1. O cliente abre `/portal/[tenantSlug]?billingToken=[token]`.
2. A pagina valida o token com escopo `billing_summary`.
3. Se o token for valido, o resumo financeiro e carregado.
4. Se o token estiver ausente, invalido ou expirado, a area financeira permanece protegida.
5. O cliente ainda pode abrir solicitacao de OS pelo portal publico, pois esse fluxo e opcional e nao financeiro.

## Dados Protegidos

- Quantidade de contratos.
- Mensalidade total.
- Equipamentos cobertos.
- Proximos vencimentos.
- Valores de parcelas.
- Proximas visitas contratadas.

## Estados Da Interface

- `protegido`: nenhum token foi informado.
- `validando`: token recebido e em verificacao.
- `link validado`: resumo liberado.
- `link invalido`: token rejeitado, expirado ou com escopo incorreto.

## Proximos Passos

- Exigir confirmacao adicional de identidade antes de dados financeiros reais em producao.
- Adicionar tela dedicada para link expirado.
- Integrar revogacao administrativa.
- Aplicar rate limit por token e IP.
