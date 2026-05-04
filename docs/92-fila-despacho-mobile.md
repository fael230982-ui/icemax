# Fila De Despacho No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Levar para o app tecnico a fila de orcamentos aprovados que ja podem seguir para despacho, mantendo o tecnico alinhado com aceite, rota, cliente e bloqueios.

## Entregas

- Secao `Fila de despacho` no app mobile.
- Botao offline `Fila despacho` no painel de sincronizacao.
- Acao offline `mobile_offline_quote_dispatch_queue` para registrar ciencia do tecnico.
- Conteudo de orientacao para rota, cliente, bloqueios e sincronizacao.

## Regras Operacionais

- A fila mobile nao substitui a prontidao: ela apenas apresenta ao tecnico o pacote aprovado.
- O tecnico deve confirmar janela, responsavel e rota antes de sair.
- Qualquer bloqueio de peca, aceite ou prontidao deve impedir execucao imediata.
- A ciencia offline vira nota da OS quando sincronizada.

## Valor Para O Produto

- Aproxima o produto do conceito de despacho inteligente em tempo real.
- Reduz ruído entre comercial, gestor e tecnico.
- Cria trilha de auditoria para equipe propria ou terceirizada.
