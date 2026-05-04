# Pos-Atendimento Offline No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Levar o fechamento comercial e de qualidade para o app de campo, mesmo sem internet, mantendo a pesquisa de satisfacao e o follow-up dentro do fluxo da OS.

## App Mobile

A secao de pos-atendimento mostra:

- pesquisa de satisfacao;
- follow-up apos a visita;
- oportunidade de contrato recorrente;
- atualizacao de historico do cliente e equipamento.

## Acao Offline

O app cria uma acao pendente para `POST /satisfaction-surveys` com:

- OS;
- cliente;
- nota;
- comentario padronizado;
- confirmacao local da resposta.

## Proximos Passos

- permitir nota real escolhida pelo cliente;
- coletar comentario livre;
- disparar follow-up automatico;
- transformar clientes promotores em oportunidade de contrato recorrente.
