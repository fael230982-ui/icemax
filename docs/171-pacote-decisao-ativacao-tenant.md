# Pacote De Decisao De Ativacao Por Tenant

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento descreve o pacote usado para decidir se um tenant whitelabel pode ativar provedores reais do reenvio offline.

## Objetivo

Consolidar gate de provedores, evidencias, orcamento, alertas, segredos seguros e aprovacao humana em uma decisao unica por tenant.

## Endpoint

- `GET /platform/mobile-offline-escalations/tenant-activation-decision`

## Decisao Atual

- `result`: `do_not_activate`
- `realExecutionAllowed`: `false`

O tenant permanece bloqueado para uso comercial enquanto existirem evidencias pendentes, gate em `keep_blocked`, teto mensal ausente, segredos fora de ambiente seguro ou aprovacao humana pendente.

## Acoes Permitidas

- Continuar desenvolvimento.
- Preparar staging.
- Coletar evidencias internas.
- Aprovar orcamento de provedores.

## Acoes Bloqueadas

- Ativar provedor real.
- Habilitar envio ao cliente.
- Habilitar retry automatico.
- Liberar tenant comercial.

## Signoffs Obrigatorios

- Titular: RAFAEL DA SILVA BEZEERA.
- Plataforma: DESENVOLVEDOR E PROJETISTA.
- Operacao: responsavel pela homologacao de negocio.

## Criterios De Liberacao

- Gate de provedores precisa sair de `keep_blocked`.
- Todas as evidencias precisam estar aprovadas sem segredos visiveis.
- Teto mensal e alertas precisam estar configurados por provedor.
- Rollback e validacao tecnica precisam estar executados.
- Aprovacao humana precisa estar registrada por tenant.
