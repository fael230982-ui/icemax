# E-Mail De Conclusao Da OS

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar o envio do e-mail final da OS depois da assinatura do cliente, com destinatario principal definido pela empresa e copia opcional para o cliente.

## Endpoint

`GET /dispatch/service-orders/:id/completion-email`

Parametros opcionais:

- `technicianUserId`: tecnico responsavel.
- `quoteId`: orcamento aprovado vinculado.
- `emailCopyToCustomer`: `true` ou `false`.

## Conteudo Do Pacote

- Destinatario da empresa.
- Copia opcional para o cliente.
- Assunto e previa do corpo do e-mail.
- Anexos esperados.
- Politica de envio, retentativa e auditoria.
- Bloqueios antes de enfileirar envio.

## Regras Operacionais

- O e-mail final so deve ser enviado depois da assinatura do cliente.
- A empresa define o e-mail principal no cadastro do tenant.
- A copia para o cliente e opcional.
- Relatorio, evidencias e assinatura digital devem estar anexados.
- Cada envio precisa de auditoria e idempotencia para evitar duplicidade.

## Painel Web

O console operacional recebeu a acao `E-mail conclusao`, que consulta a previa e os bloqueios do e-mail final da OS piloto.

## Proximos Passos

- Criar POST de enfileiramento real do e-mail.
- Conectar provider transacional quando a chave de e-mail existir.
- Registrar status de entrega e falhas por tentativa.
