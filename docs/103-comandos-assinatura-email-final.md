# Comandos De Assinatura E E-Mail Final

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Criar comandos transacionais para registrar assinatura do cliente e enfileirar o e-mail final da OS, reduzindo dependencia de notas genericas no fluxo mobile offline.

## Endpoints

`POST /dispatch/service-orders/:id/customer-signature`

Registra assinatura do responsavel, termos aceitos, decisao de copia ao cliente e identificador offline.

`POST /dispatch/service-orders/:id/completion-email`

Enfileira o e-mail final da OS com destinatario da empresa, copia opcional ao cliente e anexos esperados.

## Campos Principais

Assinatura:

- `technicianUserId`
- `quoteId`
- `responsibleName`
- `responsibleRole`
- `responsibleDocument`
- `signatureFileUrl`
- `emailCopyToCustomer`
- `acceptedTerms`
- `mobileOfflineId`

E-mail:

- `technicianUserId`
- `quoteId`
- `emailCopyToCustomer`
- `customerEmail`
- `companyEmail`
- `includeWarrantyTerms`
- `mobileOfflineId`

## App Mobile

O app tecnico passou a sincronizar assinatura e e-mail final diretamente nos endpoints de despacho, preservando o modo offline e mantendo idempotencia por `mobileOfflineId`.

## Painel Web

O console operacional recebeu acoes para registrar assinatura e enfileirar e-mail final, alem das consultas ja existentes.

## Proximos Passos

- Persistir assinatura e fila de e-mail no banco real.
- Criar tela dedicada para revisar fila de e-mails.
- Conectar provedor transacional quando a chave externa estiver disponivel.
