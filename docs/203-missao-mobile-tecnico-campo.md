# Missao Mobile Do Tecnico Em Campo

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Objetivo

Dar ao tecnico uma tela inicial mais objetiva para executar a OS em campo, reduzindo duvida sobre prioridade, proxima acao, evidencias e risco offline.

## Entrega

- Painel de missao atual no aplicativo mobile.
- Dados da OS, cliente, equipamento, prioridade, ETA e risco offline.
- Jornada visual com chegada, diagnostico, execucao e fechamento.
- Requisitos de evidencia antes da assinatura.
- Acoes rapidas para check-in, foto, checklist, peca, assinatura e sincronizacao.

## Decisao De Produto

O app mobile deve priorizar execucao pratica em campo. O tecnico precisa enxergar primeiro o que fazer agora, quais bloqueios existem e quais registros sao obrigatorios antes de encerrar a OS.

## Cuidados

- Assinatura continua bloqueada enquanto houver pendencia obrigatoria.
- Evidencias e assinatura devem ser tratadas como dados protegidos.
- A fila offline continua sendo a fonte de seguranca quando nao houver conexao.
- A sincronizacao real deve preservar idempotencia para evitar duplicidade.

## Proximas Evolucoes

- Transformar as acoes rapidas em botoes reais conectados ao `SyncPanel`.
- Adicionar captura visual de assinatura.
- Exibir checklist tecnico por tipo de servico.
- Mostrar bloqueios de fechamento em tempo real.
- Sincronizar com banco real apos virada Prisma.
