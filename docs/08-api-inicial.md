# API Inicial

Base local prevista:

- `http://localhost:3333`

## Endpoints De Sistema

### GET /health

Verifica se a API esta ativa.

### GET /meta

Retorna metadados do produto e status suportados de OS.

## Tenant

### GET /tenant/current

Retorna a empresa atual. No MVP inicial, a ICEMAX e usada como tenant piloto.

## Autenticacao E Contexto

### GET /auth/context

Retorna o contexto atual simulado de autenticacao.

Headers de desenvolvimento:

- `x-tenant-id`
- `x-user-id`
- `x-user-role`

Enquanto login real nao estiver implementado, a API usa `tenant-icemax` e papel `owner` como padrao.

### POST /auth/login

Realiza login quando `API_DATA_SOURCE="prisma"` e retorna token JWT.

### GET /auth/me

Retorna usuario e tenant da sessao atual quando informado `Authorization: Bearer <token>`.

## Dashboard

### GET /dashboard

Retorna indicadores principais, OS urgentes e visitas de contrato proximas.

## Ordens De Servico

### GET /service-orders

Lista ordens de servico.

### GET /service-orders/:id

Retorna detalhe de uma ordem de servico.

### POST /service-orders

Cria uma ordem de servico.

### POST /service-orders/:id/notes

Adiciona nota tecnica a uma OS.

### POST /service-orders/:id/photos

Adiciona foto a uma OS.

### POST /service-orders/:id/checklist-answers

Registra resposta de checklist da OS.

### POST /service-orders/:id/parts

Registra peca usada na OS.

### PATCH /service-orders/:id/status

Atualiza status da OS. Quando status for `completed`, registra conclusao.

### POST /service-orders/:id/quotes

Cria orcamento vinculado a uma OS.

## Clientes

### GET /customers

Lista clientes do tenant atual.

### POST /customers

Cria cliente no tenant atual.

## Equipamentos

### GET /equipment

Lista equipamentos do tenant atual.

### POST /equipment

Cria equipamento vinculado a cliente.

## Contratos

### GET /contracts

Lista contratos recorrentes.

### GET /contracts/due

Lista contratos com visitas proximas ou que precisam gerar OS.

### GET /contracts/:id/visits/preview

Retorna uma pre-visualizacao das proximas visitas de contrato conforme recorrencia configurada.

### POST /contracts

Cria contrato recorrente com periodicidade de 3, 4 ou 6 meses.

### POST /contracts/:id/visits/generate

Gera visitas planejadas para um contrato.

### POST /contract-visits/:id/service-order

Cria OS preventiva a partir de uma visita de contrato.

## Mapas E Plantas

### GET /floor-plans

Lista plantas e pontos mockados de equipamentos.

## Etiquetas QR

### GET /qr-labels

Lista etiquetas QR geradas para equipamentos.

## Orcamentos

### GET /quotes

Lista orcamentos mockados, incluindo status, itens e validade.

Quando `API_DATA_SOURCE="prisma"`, lista orcamentos do tenant atual com itens e cliente vinculado pela OS.

## Checklists

### GET /checklists

Lista modelos de checklist por tipo de atendimento.

Quando `API_DATA_SOURCE="prisma"`, lista modelos e itens ordenados.

## Estoque

### GET /stock

Lista itens de estoque e alertas de quantidade minima.

Quando `API_DATA_SOURCE="prisma"`, lista saldo por peca/local e calcula alertas por estoque minimo.

### POST /parts

Cria peca no cadastro do tenant.

### GET /stock-locations

Lista locais de estoque, como almoxarifado, veiculo e tecnico.

### POST /stock-locations

Cria local de estoque.

### POST /stock-movements

Registra movimentacao de estoque e atualiza saldo quando usando Prisma.

## Manuais

### GET /manuals

Lista manuais tecnicos disponiveis no app e painel.

## IA

### GET /ai/requests

Lista solicitacoes mockadas de IA.

## Notificacoes

### GET /notifications

Lista notificacoes mockadas de e-mail, WhatsApp, push ou internas.

## Integracoes

### GET /integrations

Lista status mockado das integracoes externas.

### PUT /integrations/:provider

Atualiza status/configuracao de integracao no tenant atual.

## Templates De Notificacao

### GET /notification-templates

Lista templates de notificacao.

### POST /notification-templates

Cria template de notificacao para e-mail, WhatsApp, push ou interno.

## WhatsApp

### GET /whatsapp/templates

Lista templates internos planejados para mensagens de WhatsApp.

### POST /webhooks/whatsapp

Endpoint inicial para receber eventos de webhook do WhatsApp.

## Observacao

Os endpoints atuais usam dados mockados. A proxima etapa tecnica e conectar estes contratos de resposta ao Prisma/PostgreSQL, preservando as rotas.

## Organizacao Interna

As rotas estao separadas em modulos dentro de `apps/api/src/modules`:

- `dashboard.ts`
- `orders.ts`
- `contracts.ts`
- `customers.ts`
- `equipment.ts`
- `assets.ts`
- `operations.ts`
- `integrations.ts`
