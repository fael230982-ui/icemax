# Risco E SLA Da Fila Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Priorizar pendencias offline bloqueadas por risco operacional, evitando que o gestor trate todos os bloqueios como se tivessem a mesma urgencia.

## O Que Foi Implementado

- Cada pendencia bloqueada passou a receber `severityScore` de 0 a 100.
- O score considera prioridade da acao e idade da pendencia.
- Cada item recebe `slaStatus`: `critical_now`, `attention` ou `monitor`.
- O resumo do board mostra o maior score encontrado.
- O painel web exibe risco e SLA por linha.
- Teste automatizado cobre score alto e status critico.

## Valor Operacional

Assinaturas, evidencias finais e movimentos de estoque nao devem competir no mesmo nivel de urgencia. O score ajuda supervisor, qualidade e estoque a resolverem primeiro o que bloqueia fechamento, faturamento, garantia e comunicacao com o cliente.

## Segurança

- Nenhum segredo, chave ou token foi adicionado.
- O calculo usa apenas metadados operacionais.
- O score orienta prioridade, mas nao libera reenvio automatico.
