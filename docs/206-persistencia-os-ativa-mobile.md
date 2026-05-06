# Persistencia Da OS Ativa No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Objetivo

Manter a ultima missao ativa do tecnico mesmo quando o aplicativo for fechado e aberto novamente.

## Entrega

- Chave dedicada no `AsyncStorage` para a OS ativa.
- Restauracao da OS ativa ao iniciar o app.
- Validacao contra a lista de OS permitidas.
- Fallback para a primeira OS quando o ID salvo nao existir mais.
- Gravacao automatica quando o tecnico troca de missao.

## Regra Operacional

A OS ativa salva no aparelho define qual ordem recebera check-in, foto inicial, checklist e consumo de peca pelas acoes rapidas da missao.

## Cuidados

- A persistencia da OS ativa e separada da fila offline.
- A fila offline continua mantendo suas proprias regras de retencao, prioridade e bloqueio.
- Em producao, a lista de OS permitidas deve vir da API por tecnico e tenant.

## Proxima Evolucao

- Carregar OS atribuida diretamente da API.
- Persistir tambem filtros de rota, periodo e prioridade.
- Bloquear troca de missao quando houver pendencia critica nao sincronizada.
