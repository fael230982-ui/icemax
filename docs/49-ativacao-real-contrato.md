# Ativacao Real De Contrato

## Objetivo

Transformar o aceite comercial em entidades operacionais: contrato, calendario preventivo, primeira OS preventiva e auditoria.

## Endpoint

```http
POST /service-orders/1048/contract-acceptance/activate
```

## Corpo

```json
{
  "acceptedByName": "Cliente Decisor",
  "acceptedByDocument": "000.000.000-00",
  "customerId": "customer-001",
  "equipmentIds": ["equipment-001"],
  "generateVisits": 4
}
```

## Comportamento

Em modo mock, o endpoint simula:

- contrato ativo;
- visitas preventivas planejadas;
- primeira OS preventiva;
- registro de aceite;
- entidades criadas.

Em modo Prisma, o endpoint executa transacao para:

- criar `service_contract`;
- vincular equipamentos;
- criar `service_contract_visits`;
- criar primeira `service_order`;
- vincular a primeira visita a OS;
- registrar auditoria.

## Valor Para O Produto

Esse bloco fecha o ciclo de receita recorrente:

OS corretiva -> oportunidade -> proposta -> aceite -> contrato ativo -> calendario -> primeira OS preventiva.

## Proximas Evolucoes

- Gravar aceite digital em tabela propria.
- Gerar PDF do contrato whitelabel.
- Criar cobranca recorrente no financeiro.
- Enviar confirmacao real por e-mail e WhatsApp.
- Exibir contrato ativado no painel com status comercial e operacional.
