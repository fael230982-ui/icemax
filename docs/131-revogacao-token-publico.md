# Revogacao De Token Publico

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir que a empresa desligue um link publico de acompanhamento ou resumo financeiro quando houver envio incorreto, suspeita de exposicao, cancelamento de atendimento ou solicitacao do cliente.

## Endpoint

`POST /customer-portal/public-tokens/:token/revoke?scope=service_order_tracking`

Escopos aceitos:

- `service_order_tracking`
- `billing_summary`

## Comportamento

- A revogacao exige escopo explicito.
- Em modo Prisma, o registro `PublicAccessToken` recebe `revokedAt`.
- Em modo mock, a API retorna um pacote auditavel de revogacao sem persistir token cru.
- Toda tentativa registra auditoria.
- Escopo incorreto retorna bloqueio e nao revoga outro tipo de link.

## Motivos Operacionais

- Link enviado ao destinatario errado.
- Cliente solicitou cancelamento do acesso.
- OS cancelada ou reagendada com dados sensiveis.
- Contrato foi encerrado.
- Suspeita de compartilhamento indevido.

## Proximos Passos

- Criar acao visual no painel web para revogar links.
- Listar tokens publicos ativos por cliente, OS e contrato.
- Adicionar motivo obrigatorio de revogacao.
- Notificar cliente quando um link for revogado e substituido.
