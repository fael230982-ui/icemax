# Oportunidade De Contrato

## Objetivo

Transformar atendimentos avulsos em contratos recorrentes quando a OS indicar risco de reincidencia, urgencia ou necessidade de preventiva programada.

## Endpoint

```http
GET /service-orders/1048/contract-opportunity
```

## Recomendacao

O endpoint sugere:

- score de oportunidade;
- plano recomendado;
- recorrencia de 3, 4 ou 6 meses;
- valor mensal e anual estimado;
- escopo sugerido;
- justificativas;
- proximos passos comerciais.

## Regra Inicial

- Urgencia, falta de refrigeracao ou reincidencia critica: contrato trimestral.
- Vazamento/dreno e problemas intermediarios: contrato quadrimestral.
- Preventiva simples: contrato semestral.

## Uso Comercial

Depois do pos-atendimento, o gestor pode abrir a oportunidade e converter a conversa em proposta de contrato fixo. Isso aumenta receita recorrente e reduz chamados emergenciais.

