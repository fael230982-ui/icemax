# Mobile Bloqueio Da Fila Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Evitar reenvio infinito de acoes offline que continuam falhando por erro de dados, regra de API, OS encerrada, permissao ou inconsistencia operacional.

## Regra Implementada

- Cada acao offline pode tentar sincronizar ate 5 vezes.
- Ao atingir o limite, a acao fica bloqueada para revisao.
- Acoes bloqueadas continuam visiveis no app, mas nao entram no envio automatico.
- A fila segue sincronizando outras acoes pendentes que ainda estao dentro do limite.

## Experiencia Do Tecnico

O painel mobile mostra quantas acoes estao bloqueadas e marca o item com `revisar`. Isso direciona o tecnico ou gestor para corrigir o motivo da falha em vez de repetir a mesma tentativa.

## Valor Operacional

Essa protecao melhora confiabilidade em campo e reduz duplicidade de envio. Tambem ajuda suporte a separar falha de internet de falha funcional, principalmente em eventos sensiveis como assinatura, fotos, pecas e fechamento de OS.

## Segurança

- Nenhum segredo, chave ou credencial foi adicionado.
- O bloqueio usa somente metadados locais da fila offline.
- A regra evita trafego repetido desnecessario contra a API.
