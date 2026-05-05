# Revogacao De Link No Console

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir que a operacao revogue um link publico diretamente pelo painel web usando o ID exibido no inventario de links.

## Fluxo

1. A equipe consulta `Inventario links publicos`.
2. Copia o ID do registro que deve ser encerrado.
3. Cola o ID em `Revogar link publico`.
4. O console chama `POST /customer-portal/public-token-records/:id/revoke`.
5. A API retorna o status da revogacao, escopo, entidade e preview do hash.

## Experiencia Operacional

- O token cru nao aparece na interface.
- A acao usa o token administrativo da sessao quando informado.
- A resposta fica visivel no painel para conferencia imediata.
- O fluxo atende links de acompanhamento de OS e links financeiros do portal.

## Protecoes

- Revogacao por ID reduz risco de copiar URL publica completa.
- A API valida o tenant antes de revogar.
- A auditoria registra evento separado para revogacao por registro.
- O console impede envio sem ID preenchido.

## Proximos Passos

- Transformar o inventario em tabela visual com botao de revogacao por linha.
- Exigir motivo da revogacao em producao.
- Exibir responsavel autenticado no historico de auditoria.
