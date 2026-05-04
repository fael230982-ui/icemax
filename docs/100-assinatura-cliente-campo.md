# Assinatura Do Cliente Em Campo

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar a assinatura digital do cliente depois do fechamento tecnico da OS, respeitando bloqueios de evidencias, estoque e relatorio.

## Endpoint

`GET /dispatch/service-orders/:id/customer-signature`

Parametros opcionais:

- `technicianUserId`: tecnico responsavel.
- `quoteId`: orcamento aprovado vinculado.

## Conteudo Do Pacote

- Status da assinatura.
- Gate herdado do fechamento tecnico.
- Termos exibidos ao responsavel.
- Campos de captura da assinatura.
- Decisao sobre copia por e-mail ao cliente.
- Regras de privacidade e auditoria.

## Regras Operacionais

- A assinatura fica bloqueada enquanto o fechamento tecnico nao estiver liberado.
- O app deve mostrar os termos antes da assinatura.
- O nome do responsavel, cargo/relacao e assinatura digital sao obrigatorios.
- A copia por e-mail ao cliente continua opcional.
- A assinatura deve ser armazenada como arquivo protegido.

## Painel Web

O console operacional recebeu a acao `Assinatura cliente`, que consulta o pacote de assinatura da OS piloto.

## Proximos Passos

- Criar registro efetivo da assinatura no backend.
- Conectar a assinatura ao envio final por e-mail.
- Replicar a captura no app mobile em modo offline.
