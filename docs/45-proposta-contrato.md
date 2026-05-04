# Proposta De Contrato

## Objetivo

Converter uma ordem de servico concluida ou em acompanhamento em uma proposta comercial de contrato recorrente.

## Endpoint

```http
GET /service-orders/1048/contract-proposal
```

## Entrega

O retorno inclui:

- resumo executivo;
- plano recomendado;
- valor mensal e anual estimado;
- prazo minimo, vencimento e politica de renovacao;
- servicos incluidos e nao incluidos;
- nivel de atendimento;
- texto pronto para e-mail;
- texto pronto para WhatsApp;
- fluxo de aceite;
- checklist interno antes do envio.

## Uso Comercial

Este recurso ajuda a transformar chamados corretivos em receita recorrente. A equipe comercial pode abrir a OS, gerar a oportunidade, revisar a proposta e enviar o texto profissional ao cliente sem depender de planilhas externas.

## Regra Inicial

A proposta herda a recomendacao da oportunidade de contrato:

- emergencia, equipamento sem refrigeracao ou "nao gela": plano trimestral;
- vazamento ou dreno: plano quadrimestral;
- demais casos: plano semestral.

## Proximas Evolucoes

- Gerar PDF comercial assinado pela marca whitelabel.
- Integrar aceite digital.
- Converter aceite em contrato real.
- Gerar automaticamente o calendario preventivo anual.
- Enviar proposta por WhatsApp Cloud API e e-mail transacional.
