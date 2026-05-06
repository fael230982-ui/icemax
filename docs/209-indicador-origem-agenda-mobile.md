# Indicador De Origem Da Agenda Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Dar clareza operacional ao tecnico sobre a origem das ordens de servico exibidas no app mobile.

## Entrega

- O app diferencia agenda em carregamento, agenda sincronizada pela API e agenda em contingencia.
- O servico mobile retorna a origem da carga junto com as OS normalizadas.
- Quando a API retorna OS validas, o app informa que a agenda veio do backend.
- Quando a API falha ou nao retorna OS uteis, o app informa que esta usando a lista local de seguranca.

## Impacto

Essa camada reduz risco operacional em campo, porque o tecnico consegue perceber se esta trabalhando com dados sincronizados ou com fallback offline.

## Proximo Avanco Recomendado

Bloquear troca de missao quando a OS atual tiver pendencias criticas nao sincronizadas, exigindo confirmacao operacional antes de mudar de atendimento.
