# Board De Finalizacao Da OS

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Dar ao gestor uma visao unica das OS em fechamento, mostrando pendencias de evidencias, assinatura, e-mail final e provedor de envio.

## Endpoint

`GET /dispatch/finalization-board`

## Conteudo

- Resumo de OS avaliadas.
- Quantidade com atencao.
- Quantidade prontas para envio.
- Status do provedor de e-mail.
- Linhas por OS com cliente, equipamento, tecnico, assinatura e e-mail.
- Bloqueios e proxima acao recomendada.

## Regras Operacionais

- OS com evidencias pendentes aparece como `needs_attention`.
- OS sem assinatura valida nao deve disparar e-mail final.
- Provedor de e-mail nao configurado aparece como alerta operacional, sem publicar segredo.
- O board deve ser usado antes de homologacao e antes de envio real ao cliente.

## Painel Web

O console operacional recebeu a acao `Board finalizacao`, permitindo consultar rapidamente OS com fechamento, assinatura e e-mail pendentes.

## Proximos Passos

- Criar tela dedicada com filtros por tecnico, cliente e status.
- Persistir registros no banco real.
- Adicionar retentativa e status de entrega quando o provedor transacional estiver configurado.
