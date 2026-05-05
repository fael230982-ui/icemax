# Permissoes Do Reenvio Assistido Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Definir quem pode revisar, preparar, simular e futuramente executar o reenvio assistido de uma pendencia offline bloqueada.

## O Que Foi Implementado

- Criado endpoint `GET /platform/mobile-offline-escalations/permissions`.
- A politica usa decisao padrao `deny` para etapas sensiveis.
- Revisao, preparo e dry-run ficam permitidos em modo mock para `owner`, `admin` e `supervisor`.
- Execucao real permanece bloqueada ate passar por gate de producao.
- Tecnicos, terceiros e clientes ficam impedidos de liberar fila offline interna.
- Console web ganhou botao para consultar a politica de permissoes.
- Teste automatizado cobre bloqueio da execucao real e separacao de funcoes.

## Valor Operacional

Esse bloco impede que o reenvio assistido vire uma brecha de operacao. O sistema passa a declarar a permissao por etapa, separa tecnico de gestor e prepara a futura ativacao real com auditoria, idempotencia e confirmacao dupla.

## Seguranca

- Nenhum segredo, chave, token ou credencial foi adicionado.
- O endpoint apenas expõe politica operacional, sem executar reenvio real.
- A execucao real segue bloqueada ate banco real, auditoria persistente e permissao sensivel estarem prontos.
