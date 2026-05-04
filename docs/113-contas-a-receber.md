# Contas A Receber

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Separar receita recorrente contratada de valores efetivamente a receber, permitindo que a gestao acompanhe vencimentos, atraso e bloqueios operacionais antes de novas visitas ou renovacoes.

## Endpoint

`GET /billing/receivables-board`

O endpoint retorna:

- total em aberto;
- total vencido;
- valores em dia;
- contas criticas;
- envelhecimento por faixa;
- etapa de cobranca sugerida;
- bloqueio de automacao quando o atraso exige decisao gerencial.

## Painel Web

A secao `Contas a receber` foi adicionada ao dashboard gerencial. O gestor consegue filtrar apenas contas que bloqueiam automacoes e visualizar a proxima acao de cobranca.

## Limite Atual

Este bloco nao envia cobranca real, nao gera boleto, nao executa PIX e nao faz conciliacao bancaria. Esses recursos dependem de provedor financeiro, regras fiscais e credenciais externas.
