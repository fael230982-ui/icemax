# Board De Evidencias De Provedores Do Reenvio Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento descreve o board de evidencias usado para controlar a homologacao de provedores externos antes de qualquer ativacao real.

## Objetivo

Transformar o runbook de homologacao em itens verificaveis. Cada evidencia precisa ter responsavel, fase, ambiente, resultado esperado e politica de armazenamento segura.

## Endpoint

- `GET /platform/mobile-offline-escalations/provider-evidence-board`

## Regras De Aceite

- A evidencia nao pode conter chaves, tokens, senhas, URLs privadas ou dados sensiveis.
- Prints devem ocultar qualquer segredo antes de armazenamento interno.
- Evidencias de e-mail, WhatsApp e notificacao devem usar destinatarios internos.
- Cada item precisa de responsavel, data, ambiente e resultado esperado antes da aprovacao.

## Regras De Rejeicao

- Rejeitar evidencia com segredo visivel.
- Rejeitar teste feito com cliente real antes da homologacao externa aprovada.
- Rejeitar evidencia sem comando de validacao ou sem log de resultado.
- Rejeitar aprovacao de producao enquanto o gate estiver em `keep_blocked`.

## Politica De Armazenamento

As evidencias devem ficar em local interno seguro. O repositorio GitHub nao deve receber anexos sensiveis, prints com credenciais, URLs privadas, logs brutos ou dados reais de clientes.

## Proxima Acao

Preparar a captura das evidencias da fase de selecao, definir responsavel por revisao de itens sensiveis e manter a producao bloqueada ate o gate permitir avancar.
