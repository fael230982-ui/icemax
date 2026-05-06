# Politica De Cofre De Credenciais De Provedores

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Endpoint

`GET /integrations/provider-credential-vault-policy`

## Objetivo

Definir como credenciais de e-mail, WhatsApp, mapas e OpenAI devem ser protegidas antes de qualquer ativacao real de provedores.

## Regras

- Segredo nao pode ser salvo no repositorio.
- Segredo nao pode entrar em payload de fila.
- Segredo nao pode aparecer em log, erro, auditoria ou console web.
- Banco real deve guardar somente referencia segura ao cofre.
- Interface deve exibir somente indicador mascarado.
- Rotacao precisa de motivo, responsavel e auditoria.

## Acesso

- Somente owner e admin podem cadastrar, revogar ou rotacionar credenciais.
- Tecnicos proprios e terceirizados nao acessam credenciais.
- MFA deve ser obrigatorio em producao para alteracao de segredo.

## Bloqueios

- Commitar segredo no Git.
- Retornar segredo pela API.
- Mostrar segredo no painel.
- Salvar token em notificacao.
- Rotacionar chave sem motivo auditavel.
