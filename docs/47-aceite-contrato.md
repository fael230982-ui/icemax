# Aceite De Contrato

## Objetivo

Preparar o pacote final para transformar uma proposta aprovada em contrato recorrente ativo.

## Endpoint

```http
GET /service-orders/1048/contract-acceptance-package
```

## Entrega

O retorno inclui:

- documento de aceite;
- texto de aceite com plano, recorrencia, valor e vigencia;
- campos de assinatura;
- checks obrigatorios antes da ativacao;
- handoff para financeiro, despacho e sucesso do cliente;
- mensagens para e-mail e WhatsApp;
- entidades que devem ser criadas na ativacao final;
- bloqueios que impedem a ativacao.

## Fluxo Operacional

1. Conferir decisor do cliente.
2. Confirmar equipamentos cobertos.
3. Validar margem comercial.
4. Definir regra de faturamento.
5. Registrar consentimento de comunicacao.
6. Confirmar janela da primeira visita.
7. Coletar aceite formal.
8. Ativar contrato, calendario, primeira OS e cobranca.

## Valor Para O Produto

Este bloco reduz falhas na passagem entre comercial e operacao. A empresa deixa de depender de memoria, mensagens soltas ou planilhas para ativar contratos recorrentes.

## Proximas Evolucoes

- Criar aceite digital assinado.
- Enviar aceite por e-mail e WhatsApp.
- Criar contrato no banco real apos aceite.
- Gerar auditoria imutavel do aceite.
- Vincular cobranca recorrente ao financeiro.
