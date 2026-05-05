# Inventario De Links No Console

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Conectar o inventario de tokens publicos ao console operacional web para que a equipe visualize links de acompanhamento e portal financeiro sem depender de chamadas manuais na API.

## O Que Foi Conectado

- Metodo `customerPortalPublicTokens` no cliente web.
- Botao `Inventario links publicos` no console operacional.
- Filtro inicial `status=all` para mostrar ativos, revogados e expirados.
- Saida no painel de resultado JSON ja existente.

## Uso Operacional

- Conferir quais links foram emitidos durante atendimento.
- Verificar se um link foi revogado.
- Apoiar atendimento ao cliente quando ele pedir novo acesso.
- Auditar links de OS e links financeiros.
- Preparar uma futura tela dedicada de seguranca.

## Protecoes Mantidas

- O painel nao recebe token cru na listagem.
- A API retorna apenas preview do hash.
- A consulta e auditada no back-end.
- O filtro pode evoluir para busca por cliente, OS, contrato e status.

## Proximos Passos

- Criar tabela visual dedicada em vez de JSON bruto.
- Adicionar acao de revogar link pela interface.
- Exibir badge por status.
- Adicionar busca por OS, cliente e escopo.
