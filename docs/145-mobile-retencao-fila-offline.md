# Mobile Retencao Da Fila Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Evitar que dados operacionais de OS permaneçam indefinidamente no aparelho do tecnico quando a fila offline nao for sincronizada por muito tempo.

## Regra Aplicada

- Acoes normais: retencao local de 72 horas.
- Acoes altas: retencao local de 96 horas.
- Acoes criticas: retencao local de 168 horas.

## O Que Foi Implementado

- Criada politica local de retencao por prioridade.
- O app descarta automaticamente acoes expiradas ao restaurar a fila offline.
- O app tambem remove acoes expiradas antes de salvar a fila no armazenamento local.
- A tela informa quantas pendencias foram restauradas e quantas foram descartadas por idade.

## Valor Em Campo

A melhoria protege a operacao em aparelhos compartilhados, tecnicos terceirizados e periodos longos sem sincronizacao. Eventos criticos, como assinatura e fechamento de OS, continuam tendo janela maior de recuperacao.

## Segurança

- Nenhum segredo, token ou credencial foi armazenado.
- A politica reduz exposicao local de dados de cliente, evidencias e apontamentos tecnicos.
- A limpeza acontece no proprio app, sem depender de conexao com a API.
