# Ativacao De Contrato

## Objetivo

Fechar o ciclo comercial: depois da oportunidade e da proposta, o sistema prepara a ativacao do contrato recorrente.

## Endpoint

```http
GET /service-orders/1048/contract-activation-plan
```

## Entrega

O retorno inclui:

- rascunho do contrato;
- data sugerida de inicio;
- calendario preventivo inicial;
- rascunho da primeira OS preventiva;
- passos de ativacao;
- controles de governanca;
- mensagens de confirmacao para cliente e equipe interna.

## Fluxo

1. Receber aceite formal da proposta.
2. Cadastrar contrato recorrente.
3. Vincular equipamentos e endereco.
4. Gerar calendario preventivo.
5. Criar primeira OS preventiva.
6. Enviar confirmacao ao cliente.

## Valor Para O Produto

Este bloco evita que a proposta aprovada fique perdida. A plataforma passa a orientar a operacao para transformar aceite em contrato ativo, agenda, OS e comunicacao.

## Proximas Evolucoes

- Criar endpoint transacional para ativar contrato no banco real.
- Gerar contrato em PDF whitelabel.
- Registrar assinatura digital.
- Sincronizar vencimentos com financeiro.
- Disparar mensagens reais por e-mail e WhatsApp.
