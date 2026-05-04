# Portal Publico Do Cliente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco cria a tela publica whitelabel para o cliente abrir uma solicitacao de atendimento quando a empresa permitir esse canal.

A rota criada e `/portal/[tenantSlug]`. Para a ICEMAX, o endereco local fica `/portal/icemax`.

## Experiencia

- Hero com nome da empresa resolvido pelo slug.
- Formulario com cliente, e-mail, telefone, endereco, tipo de equipamento, identificacao do equipamento, descricao do problema e urgencia.
- Checkbox de autorizacao para contato operacional por WhatsApp.
- Estado visual de envio, sucesso e erro.
- Painel lateral com orientacoes de preenchimento, triagem e privacidade.

## Integracao

O formulario usa o endpoint ja existente `POST /customer-portal/service-orders`.

Enquanto a API local estiver ativa, o envio retorna o protocolo mock da OS. Quando a API estiver desligada, a tela continua compilando e mostra erro amigavel ao cliente.

## Regras De Produto

- A abertura de OS pelo cliente segue opcional por empresa.
- A solicitacao nao despacha tecnico automaticamente; antes passa por triagem operacional.
- Dados financeiros, contratos e observacoes internas nao sao exibidos no portal publico.
- O fluxo prepara a continuidade com link publico de acompanhamento e fila de comunicacao.

## Proximos Passos

- Persistir a solicitacao em banco real.
- Configurar por tenant se o portal publico fica ativo ou nao.
- Permitir upload de fotos pelo cliente.
- Enviar confirmacao automatica por WhatsApp e e-mail quando as chaves externas estiverem ativas.
