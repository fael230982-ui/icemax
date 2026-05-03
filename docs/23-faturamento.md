# Faturamento

## Objetivo

Preparar cobranca a partir de OS, pecas e servicos executados.

## Implementacao Atual

- `POST /billing/invoices/draft`
- Calcula subtotal e total.
- Mantem status como rascunho.

## Proxima Evolucao

Integrar boleto, Pix, nota fiscal, recorrencia de contratos e contas a receber.
