# Acoes Rapidas Offline Na Missao Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Objetivo

Transformar o painel de missao atual do tecnico em uma area operacional, nao apenas informativa.

## Acoes Conectadas

- Check-in: registra localizacao e status da OS na fila offline.
- Foto before: registra evidencia inicial da OS.
- Checklist: registra resposta tecnica inicial.
- Peca usada: registra consumo de peca.
- Assinatura: reutiliza o fluxo offline de assinatura e aceite.
- Sincronizar: tenta enviar a fila conforme prioridade e bloqueios.

## Decisao Tecnica

As acoes rapidas usam as mesmas funcoes do fluxo offline existente. Isso evita duplicidade de regras entre o painel de missao e o `SyncPanel`.

## Regras De Segurança

- Evidencias e assinaturas continuam como itens criticos.
- A fila preserva prioridade, tentativa e bloqueio por excesso de reenvio.
- Sincronizacao real continua respeitando idempotencia e revisao de pendencias bloqueadas.

## Proxima Evolucao

- Substituir dados fixos da missao por OS selecionada.
- Adicionar estado visual de acao concluida.
- Abrir captura real de camera e assinatura.
- Mostrar bloqueios antes de permitir assinatura final.
