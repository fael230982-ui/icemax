# Anexos Publicos De OS

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco prepara o recebimento seguro de fotos e documentos enviados pelo cliente no portal publico.

O foco e permitir que o cliente envie evidencias do problema sem expor dados internos e sem gravar arquivos reais antes das validacoes de seguranca.

## API

Endpoint criado:

- `POST /customer-portal/service-orders/:id/attachments`

O endpoint recebe um manifesto com:

- `tenantSlug`
- `customerEmail`
- `attachments`
- `fileName`
- `mimeType`
- `sizeBytes`
- `caption`

## Saida

O retorno informa:

- arquivos aceitos
- total de fotos e documentos
- preparo para analise visual por IA
- hints extraidos das legendas
- regras de privacidade
- proximas acoes tecnicas

## Regras De Seguranca

- Tipos aceitos: JPEG, PNG, WebP e PDF.
- Tamanho maximo por arquivo: 10 MB.
- Maximo de 8 anexos por manifesto.
- Antes de storage real, o arquivo deve passar por antivirus e validacao real de MIME.
- Dados internos, observacoes administrativas e telefone pessoal do tecnico continuam ocultos.

## Proximos Passos

- Criar upload real assinado para storage privado por tenant.
- Vincular anexos ao banco real.
- Exibir anexos aceitos no painel web da OS.
- Enviar fotos para IA visual quando a chave OpenAI estiver configurada.
