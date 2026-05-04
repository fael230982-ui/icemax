# Faturamento Recorrente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Criar uma visao operacional para contratos fixos de manutencao, permitindo acompanhar receita recorrente, proximos vencimentos e riscos antes da emissao de cobrancas reais.

## Endpoint

`GET /billing/recurring-board`

O endpoint retorna:

- resumo de contratos ativos no board;
- MRR, ARR e total dos proximos vencimentos;
- vencimento e valor da proxima parcela por contrato;
- risco financeiro operacional;
- motivos de atencao e proxima acao recomendada;
- governanca para impedir emissao automatica sem revisao fiscal.

## Painel Web

O painel `Faturamento recorrente` aparece no dashboard gerencial e permite filtrar contratos que exigem atencao. A tela usa fallback local quando a API nao esta disponivel, mantendo a experiencia navegavel em demonstracoes.

## Governanca

Este bloco ainda nao executa cobranca real, boleto, PIX, cartao ou envio fiscal. A cobranca real dependera de escolha futura de provedor financeiro, regras fiscais e chaves de integracao.
