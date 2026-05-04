# Financeiro De Contrato

## Objetivo

Preparar a cobranca recorrente de contratos de manutencao.

## Endpoint

```http
GET /contracts/contract-001/billing-plan
```

## Entrega

O retorno inclui:

- valor mensal estimado;
- valor anual;
- regras de vencimento;
- multa e juros planejados;
- canais de envio de cobranca;
- 12 mensalidades planejadas;
- handoff para o financeiro.

## Valor Para O Produto

Esse bloco conecta contrato ativo com receita recorrente. A operacao passa a ter previsibilidade de cobranca e reduz risco de contrato ativo sem faturamento.

## Proximas Evolucoes

- Criar faturas reais no banco.
- Registrar pagamentos e inadimplencia.
- Integrar com gateway de pagamento.
- Enviar cobranca por e-mail e WhatsApp.
- Exibir MRR, ARR e churn no dashboard executivo.
