# Carga De OS Atribuidas Pela API No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Conectar o app tecnico a uma carga real de ordens de servico atribuidas pela API, mantendo a operacao segura quando o backend estiver indisponivel.

## Entrega

- O app mobile passa a buscar OS em `/service-orders?status=in_progress`.
- A resposta da API e normalizada para o formato esperado pelos cards e pela missao atual.
- Campos de cliente, equipamento, prioridade, ETA, risco offline e proxima acao aceitam nomes alternativos vindos do backend.
- A lista local continua como fallback operacional para modo offline ou indisponibilidade da API.
- A restauracao da OS ativa usa a lista carregada e valida se a OS ainda existe para o tecnico.

## Regras Operacionais

- Se a API responder com lista vazia, o app usa as OS locais de demonstracao.
- Se a API falhar, o tecnico continua operando em modo offline com fila local.
- A OS ativa persistida so e restaurada quando ainda esta presente na lista permitida.
- Acoes de campo continuam apontando para a OS ativa selecionada.

## Proximo Avanco Recomendado

Adicionar indicador visual de origem da lista, diferenciando OS carregadas da API, OS locais de fallback e OS com pendencias criticas nao sincronizadas.
