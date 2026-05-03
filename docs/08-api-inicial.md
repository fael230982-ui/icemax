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

## Despacho, Agenda E Rotas

### GET /technicians/locations

Lista ultima localizacao conhecida dos tecnicos em modo mock/local.

### POST /technicians/:id/location

Registra localizacao enviada pelo app tecnico.

Campos:

- `latitude`;
- `longitude`;
- `accuracy`;
- `serviceOrderId`;
- `capturedAt`.

### POST /dispatch/routes/optimize

Retorna uma rota sugerida para um tecnico, priorizando urgencia e depois distancia aproximada. No modo atual, usa calculo local para desenvolvimento; em producao, deve ser substituido por integracao com mapas.

## Ordens De Servico

### GET /service-orders

Lista ordens de servico.

Filtros opcionais:

- `status`
- `priority`
- `customer`

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

### POST /service-orders/:id/report

Gera relatorio local da OS e retorna URL interna. Em desenvolvimento, tenta gerar PDF com Chrome/Edge headless e usa HTML como fallback.

## SLA

### GET /sla/board

Retorna painel de prazos por OS, prioridade, risco e minutos restantes.

## Garantias

### POST /warranty-terms

Cria termo de garantia vinculado a OS e cliente.

## PMOC

### POST /pmoc/plans

Cria plano PMOC com responsavel tecnico, equipamentos e frequencia.

## Faturamento

### POST /billing/invoices/draft

Cria rascunho de cobranca a partir de OS e itens.

## Tecnicos E Terceirizados

### POST /technicians/onboarding

Cadastra tecnico interno ou terceirizado para aprovacao operacional.

## Janelas De Manutencao

### POST /maintenance-windows

Cria preferencia de periodo para visitas recorrentes de contrato.

## Satisfacao

### POST /satisfaction-surveys

Registra nota e comentario de satisfacao apos OS.

## Historico De Equipamento

### GET /equipment/:id/timeline

Retorna linha do tempo operacional do equipamento.

## Compras

### GET /purchase-requests/suggestions

Lista sugestoes de compra por estoque abaixo do minimo.

### POST /purchase-requests

Cria solicitacao de compra.

## Release

### POST /release-readiness

Cria checklist de prontidao para homologacao ou release.

## Suite De Escala

### POST /whitelabel/brands

Cria marca whitelabel em rascunho.

### POST /permissions/policies

Cria politica de permissao.

### POST /security/incidents

Registra incidente de seguranca.

### POST /lgpd/requests

Registra solicitacao LGPD.

### POST /maps/geocode-preview

Simula geocodificacao local.

### POST /communications/preview

Gera previa de comunicacao por e-mail, WhatsApp ou push.

### POST /service-catalog/items

Cria item de catalogo de servico.

### POST /price-books

Cria tabela de preco.

### GET /kpis/executive

Retorna resumo executivo.

### POST /km-reimbursements

Cria reembolso de KM.

### POST /technician-payables

Cria repasse para tecnico.

### POST /contract-renewals

Cria proposta de renovacao de contrato.

### GET /customers/:id/health

Retorna saude do cliente.

### GET /equipment/:id/depreciation

Retorna depreciacao estimada do equipamento.

### POST /training/checklists

Cria checklist de treinamento.

### POST /manuals/import-jobs

Cria fila de importacao de manuais.

### POST /backup-plans

Cria plano de backup.

### POST /incident-playbooks

Cria playbook de incidente.

## Suite De Aceleracao

### GET /acceleration/lots

Lista 99 lotes conectados para aceleracao futura.

### POST /acceleration/lots/:key/run

Executa um lote especifico em modo mock/auditavel.

### POST /acceleration/lots/run-all

Executa os 99 lotes conectados e retorna contagem consolidada.

## Diagnostico Da Plataforma

### GET /platform/readiness

Retorna prontidao operacional, bloqueios e integracoes pendentes.

### GET /platform/modules

Lista catalogo de modulos e maturidade.

### GET /platform/roles

Retorna matriz inicial de papeis e permissoes.

### GET /platform/diagnostics

Retorna diagnostico tecnico de ambiente, storage e dependencias externas.

### GET /platform/pre-release-gate

Retorna semaforo de pre-release com bloqueios, alertas e recomendacao.

## Homologacao E Observabilidade

### GET /api-contract/routes

Lista contratos principais de API para validacao e integracao.

### GET /homologation/scenarios

Lista cenarios de homologacao operacional.

### POST /homologation/scenarios/:key/run

Executa um cenario de homologacao em modo mock e registra auditoria.

### GET /observability/summary

Retorna sinais operacionais locais para suporte e validacao.

### GET /demo-data/snapshot

Retorna snapshot dos dados mockados usados em demonstracao.

## Transicao Para Banco Real

### GET /database/cutover-plan

Retorna plano de virada de mock para Prisma/PostgreSQL.

### GET /database/schema-summary

Resume dominios e modelos principais do schema Prisma.

### GET /database/seed-plan

Descreve dados criados pelo seed inicial.

### GET /database/environment-checklist

Lista variaveis necessarias para modo mock e modo Prisma.

## Arquivos

### POST /files

Recebe arquivo em JSON/base64 e salva no storage local de desenvolvimento.

Campos:

- `folder`: `uploads`, `manuals`, `signatures`, `floor-plans` ou `reports`;
- `fileName`;
- `mimeType`;
- `base64`.

### GET /files/*

Serve arquivos locais gerados em desenvolvimento, como relatorios e uploads.

## Clientes

### GET /customers

Lista clientes do tenant atual.

### POST /customers

Cria cliente no tenant atual.

## Portal Do Cliente

### GET /customer-portal/:tenantSlug/config

Retorna configuracao publica minima do portal do cliente para a empresa whitelabel.

### POST /customer-portal/service-orders

Permite que o cliente abra uma OS opcionalmente, sem obrigar uso do app. A solicitacao entra como `open` para triagem da empresa.

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

### POST /qr-labels

Cria etiqueta QR em SVG para impressao e retorna `fileUrl`.

### GET /qr-labels/:id/print

Gera arquivo SVG de uma etiqueta existente mockada para impressao.

## Orcamentos

### GET /quotes

Lista orcamentos mockados, incluindo status, itens e validade.

Quando `API_DATA_SOURCE="prisma"`, lista orcamentos do tenant atual com itens e cliente vinculado pela OS.

### PATCH /quotes/:id/decision

Registra aprovacao ou recusa do orcamento.

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

### POST /ai/text-improve

Revisa texto tecnico com regras locais enquanto a chave OpenAI nao esta configurada.

### POST /ai/issue-cause-suggestions

Sugere causas provaveis a partir de descricao, tipo de equipamento e pistas de foto.

## Notificacoes

### GET /notifications

Lista notificacoes mockadas de e-mail, WhatsApp, push ou internas.

### POST /notifications/send

Cria envio de notificacao em fila. No momento, o envio e simulado/local.

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

## Auditoria

### GET /audit-log

Lista eventos recentes de auditoria do tenant atual. A rota exige papel `owner` ou `admin` quando o contexto autenticado informar permissao.

## Observacao

Os endpoints atuais usam dados mockados. A proxima etapa tecnica e conectar estes contratos de resposta ao Prisma/PostgreSQL, preservando as rotas.

## Organizacao Interna

As rotas estao separadas em modulos dentro de `apps/api/src/modules`:

- `dashboard.ts`
- `dispatch.ts`
- `orders.ts`
- `contracts.ts`
- `customers.ts`
- `equipment.ts`
- `assets.ts`
- `operations.ts`
- `integrations.ts`
- `files.ts`
- `audit.ts`
