# Trava De Troca De OS Com Pendencia Critica No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Evitar que o tecnico mude de missao enquanto a OS atual ainda possui pendencias criticas offline.

## Entrega

- O app identifica a OS vinculada a cada acao offline pendente.
- Acoes criticas da OS atual bloqueiam a troca para outra OS.
- O tecnico recebe uma mensagem objetiva informando a quantidade de pendencias criticas.
- A troca permanece liberada quando nao existem pendencias criticas da missao atual.

## Pendencias Criticas

Sao tratadas como criticas as acoes marcadas com prioridade `critical`, como assinatura do cliente, foto final, evidencia de problema e comandos bloqueados por excesso de tentativa.

## Impacto

Essa regra reduz risco de perda operacional no campo, principalmente em fechamento de OS, garantia, assinatura e evidencias obrigatorias.

## Proximo Avanco Recomendado

Adicionar uma tela de revisao de pendencias criticas com botao direto para tentar sincronizar, revisar detalhe da acao e solicitar apoio do gestor.
