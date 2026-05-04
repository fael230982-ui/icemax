# Fila De Despacho De Orcamentos Aprovados

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Conectar o ciclo comercial de orcamento aprovado ao despacho operacional, evitando que a equipe execute servicos sem aceite ou sem prontidao minima.

## Entregas

- Endpoint `GET /dispatch/quote-execution-queue`.
- Fila baseada em orcamentos aprovados com OS vinculada.
- Recomendacao de tecnico reaproveitando score de prioridade, status e distancia.
- Prontidao da OS considerada antes de liberar o deslocamento.
- Botao `Fila orcamentos aprovados` no painel web.
- Teste automatizado cobrindo a fila de orcamentos aprovados.

## Regras Operacionais

- Orcamentos nao aprovados ficam fora da fila.
- OS sem prontidao fica como `needs_preparation`.
- A fila expõe bloqueios, atencoes, rota e tecnico recomendado.
- O pacote orienta envio ao app mobile, confirmacao da janela do cliente e registro de saida.

## Proximo Passo Natural

Persistir essa fila em banco real com historico de atribuicao, aceite do tecnico, reotimizacao de rota e auditoria de mudanca manual pelo gestor.
