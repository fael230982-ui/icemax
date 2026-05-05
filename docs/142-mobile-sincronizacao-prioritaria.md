# Mobile Sincronizacao Prioritaria

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Garantir que a fila offline envie primeiro os registros mais importantes quando a conexao voltar.

## Mudancas

- Criado ordenador de fila offline por prioridade.
- A ordem de envio agora e: critica, alta e normal.
- Empate de prioridade usa a data mais antiga primeiro.
- A lista exibida ao tecnico segue a mesma ordem usada na sincronizacao.

## Impacto

Assinaturas, fotos criticas, fechamento de campo e evidencias relevantes tendem a chegar antes de anotacoes auxiliares quando a rede esta instavel.

## Proximos Passos

- Separar falha parcial por item.
- Remover da fila somente o item confirmado pela API.
- Adicionar retry com intervalo progressivo.
