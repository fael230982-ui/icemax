# Board Gerencial Da Fila Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Dar ao gestor uma visao clara das acoes offline que ficaram bloqueadas no app do tecnico apos excesso de tentativas.

## O Que Foi Implementado

- Criado endpoint `/platform/mobile-offline-escalations`.
- O endpoint retorna politica de tentativa, resumo gerencial e itens bloqueados.
- Cada item informa tecnico, OS, cliente, acao, prioridade, motivo provavel e recomendacao.
- O console web ganhou botao `Pendencias offline`.
- O painel web exibe tabela com OS, tecnico, acao, motivo e recomendacao.
- Teste automatizado cobre politica de 5 tentativas e itens bloqueados.

## Valor Operacional

Essa evolucao fecha o ciclo iniciado no app mobile: quando o tecnico nao consegue sincronizar uma acao depois de varias tentativas, o problema deixa de ficar preso no aparelho e vira pauta visivel para supervisor, qualidade ou estoque.

## Regras De Segurança

- Nenhum segredo, token ou credencial foi adicionado.
- O board trabalha com metadados operacionais e nao expõe token de sessao.
- A recomendacao e gerencial; reenvio assistido ainda deve exigir regra propria antes de producao.
