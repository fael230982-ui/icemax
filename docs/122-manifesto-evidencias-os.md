# Manifesto De Evidencias Da OS

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

O manifesto de evidencias organiza os arquivos e metadados obrigatorios para encerrar uma ordem de servico com seguranca: fotos, relatorio tecnico, assinatura do cliente, identificacao do equipamento e contato do cliente.

Ele prepara a base para arquivo tecnico, envio por e-mail, compartilhamento no portal do cliente e auditoria futura.

## Endpoint

`GET /service-orders/:id/evidence-manifest`

O retorno inclui:

- status geral do manifesto;
- total de evidencias;
- evidencias bloqueadas ou em atencao;
- politica de retencao;
- governanca de storage privado;
- lista de proximas acoes.

## Regras

1. Assinatura digital e relatorio final sao evidencias obrigatorias.
2. Fotos tecnicas devem ser classificadas como restritas.
3. Compartilhamento com cliente deve ocorrer apenas por e-mail auditado, portal autenticado ou link expiravel.
4. Arquivos sensiveis devem migrar para storage privado antes de producao.
5. O manifesto sempre deve respeitar tenantId e historico da OS.

## Uso No Console

A acao de revisao de conclusao da OS agora consulta tambem o manifesto de evidencias. Assim, o gestor enxerga se a OS esta pronta para fechamento, envio e arquivamento.
