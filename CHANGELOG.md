# Changelog

Todas as alteracoes relevantes deste projeto devem ser registradas aqui antes de releases, homologacoes ou publicacoes importantes.

## 0.1.0 - Lote 1

- Criada estrutura base do projeto ICEMAX.
- Adicionada documentacao inicial de produto, arquitetura, roadmap, LGPD e backlog.
- Adicionado prototipo web estatico do painel operacional.
- Criado esqueleto tecnico com web, API, mobile, pacote compartilhado e banco.
- Adicionada licenca proprietaria.

## 0.1.1 - Lote 2

- Configurada autoria local do Git com nome e e-mail corretos.
- Expandido painel web para dashboard operacional com ordens, agenda, campo, estoque, IA e whitelabel.
- Adicionado modulo de contratos recorrentes de manutencao.
- Documentado controle de contratos com ciclos de 3, 4 e 6 meses.
- Atualizado schema Prisma e SQL conceitual com contratos, equipamentos cobertos e visitas previstas.
- Adicionadas rotas mockadas na API para dashboard, ordens de servico e contratos.
- Documentados endpoints iniciais da API.
- Adicionados mapas interativos de plantas e localizacao de equipamentos ao escopo.
- Adicionado gerador de etiquetas QR por equipamento ao escopo.
- Atualizados API mockada, painel e schema com plantas, pontos de equipamento e QR labels.

## 0.2.0 - Lote 4

- Expandido escopo para projeto completo, incluindo orcamentos, aprovacoes, checklists, estoque avancado, manuais, IA, notificacoes, auditoria e relatorios.
- Criada lista de pendencias do cliente para acelerar futuras integracoes e homologacao.
- Schema Prisma ampliado com modulos operacionais completos.
- SQL conceitual sincronizado com os novos modulos.
- API mockada expandida com rotas de orcamentos, checklists, estoque, manuais, IA e notificacoes.
- Painel web atualizado com cards dos novos modulos.
- App tecnico ampliado com OS, ferramentas de campo e contratos proximos.
- Adicionada logica compartilhada para pre-visualizacao de visitas recorrentes de contrato.
- Adicionado `docker-compose.yml` para PostgreSQL local.
- Documentado ambiente local.

## 0.2.1 - Lote 5

- Adicionado WhatsApp como integracao formal do produto.
- Documentadas contas e chaves externas para OpenAI, Google Maps, WhatsApp, e-mail, hospedagem e dominio.
- Atualizado schema com templates de notificacao, eventos de WhatsApp e configuracoes de integracao.
- API mockada ampliada com integracoes, templates de WhatsApp e webhook inicial.
- Criada analise de referencias publicas de mercado.
- Incluidos PMOC, PCM, check-in/out, controle de KM e satisfacao no escopo.
- Criados modelos operacionais iniciais de checklists, pecas, garantia, relatorio e pesquisa de satisfacao.

## 0.2.2 - Lote 6

- Criado seed inicial do banco com dados ficticios da ICEMAX.
- Adicionado script `db:seed`.
- Adicionado script `validate`.
- Adicionado script `audit:full`.
- API reorganizada em modulos por dominio.
- Documentado fluxo local de migrations e seed.
- Separada validacao operacional de auditoria de dependencias.

## 0.2.3 - Lote 7

- Criado cliente de API para o painel web.
- Criado helper de dados locais para transicao entre mock e API.
- Documentada estrategia frontend/API.
- Adicionada variavel `NEXT_PUBLIC_API_URL`.

## 0.2.4 - Lote 8

- Criado gerador de PDF para documentos Markdown.
- Adicionado script `docs:pdf`.
- Criada pasta `docs-pdf/` para copias em PDF dos documentos de leitura.
- Adicionada camada inicial para alternar API entre mock e Prisma.
- Criados repositorios iniciais de dashboard e ordens.
- Criado contexto de autenticacao simulado por headers.

## 0.2.5 - Lote 9

- Adicionados endpoints iniciais de clientes e equipamentos.
- Contratos passaram a suportar mock e Prisma.
- Adicionados repositorios de clientes, equipamentos e contratos.

## 0.3.0 - Lote 10

- Painel web refatorado em componentes reutilizaveis.
- Adicionadas secoes de clientes e equipamentos ao painel.
- Dados locais ampliados para clientes e equipamentos.
- API de orcamentos, checklists e estoque preparada para mock/Prisma.

## 0.3.1 - Lote 11

- App tecnico refatorado em componentes reutilizaveis.
- Dados locais do mobile separados.
- App tecnico ampliado com prioridade, offline e qualidade.

## 0.3.2 - Lote 12

- Adicionadas validacoes de entrada com Zod na API.
- Criados endpoints POST para clientes, equipamentos, ordens de servico e contratos.
- Adicionado handler global de erros da API.

## 0.3.3 - Lote 13

- Adicionados endpoints de execucao da OS: notas, fotos, checklist, pecas, status e orcamento.
- Repositorio de ordens expandido para registrar execucao em mock ou Prisma.

## 0.3.4 - Lote 14

- Estoque acelerado com endpoints de pecas, locais e movimentacoes.
- Movimentacao de estoque com transacao Prisma para atualizar saldos.
- Contratos acelerados com geracao de visitas recorrentes e OS preventiva a partir da visita.
- Integracoes aceleradas com templates de notificacao e atualizacao de status.

## 0.4.0 - Lote 15

- Adicionada autenticacao real com argon2 e JWT via jose.
- Criadas rotas `/auth/login` e `/auth/me`.
- Contexto multiempresa passou a aceitar Bearer token.
- Seed passou a criar senha local com hash seguro.

## 0.4.1 - Lote 16

- Criada camada local de arquivos.
- Criado gerador HTML de relatorio de OS.
- Adicionado endpoint para gerar relatorio de OS.
- Adicionada rota local para servir arquivos em desenvolvimento.

## 0.4.2 - Lote 17

- Verificado que Docker nao esta disponivel no ambiente atual.
- Documentada alternativa com PostgreSQL remoto via `DATABASE_URL`.
- Cliente de API do painel expandido para login e criacao de entidades principais.

## 0.4.3 - Lote 18

- Adicionado painel client-side de login no web.
- Adicionado painel de criacao rapida para testar API.
- Criados componentes de formulario inicial no painel.
- Relatorio de OS passou a tentar gerar PDF real com Chrome/Edge headless e fallback HTML.

## 0.4.4 - Lote 19

- Criada aprovacao/recusa de orcamento.
- Criado envio simulado de notificacoes.

## 0.5.0 - Lote 20

- Criada factory `buildApp` para testar API sem abrir porta.
- Adicionados testes de fluxos criticos da API em modo mock.
- Script `test` adicionado ao monorepo e API.
- `validate` passou a executar testes.

## 0.5.1 - Lote 21

- Adicionado upload local de arquivos por JSON/base64.
- Adicionada geracao de etiquetas QR em SVG.
- Adicionado log de auditoria para eventos operacionais.
- Lista de OS passou a aceitar filtros por status, prioridade e cliente.
- Painel web ganhou console operacional conectado a API.
- App mobile ganhou base de fila offline e sincronizacao.

## 0.5.2 - Lote 22

- Adicionadas rotas de despacho e localizacao de tecnicos.
- Criada otimizacao local de rota por prioridade e distancia aproximada.
- Painel web passou a consultar equipe e solicitar rota otimizada.
- App mobile passou a colocar localizacao na fila offline.
- Documentado despacho, rotas e rastreamento com cuidados de LGPD.

## 0.5.3 - Lote 23

- Adicionados endpoints locais de IA operacional.
- Criada revisao de texto tecnico sem dependencia externa.
- Criada sugestao local de causas provaveis por regras.
- Painel web passou a acionar revisao de texto e sugestao de causas.
- Documentadas regras de uso assistivo da IA.

## 0.5.4 - Lote 24

- Adicionado portal publico opcional para cliente abrir OS.
- Criada configuracao publica por tenant/slug.
- Painel web passou a disparar solicitacao de OS pelo cliente para teste.
- Documentado fluxo operacional do portal do cliente.

## 0.6.0 - Lotes 25 A 34

- Lote 25: adicionado painel de SLA operacional.
- Lote 26: adicionada emissao inicial de termos de garantia.
- Lote 27: adicionada criacao inicial de plano PMOC.
- Lote 28: adicionado rascunho de faturamento.
- Lote 29: adicionado onboarding de tecnico interno ou terceirizado.
- Lote 30: adicionadas janelas de manutencao recorrente.
- Lote 31: adicionada pesquisa de satisfacao/NPS.
- Lote 32: adicionada linha do tempo de equipamento.
- Lote 33: adicionadas sugestoes e solicitacoes de compra.
- Lote 34: adicionada prontidao de release.

## 0.7.0 - Lotes 35 A 54

- Lote 35: marcas whitelabel.
- Lote 36: politicas de permissao.
- Lote 37: incidentes de seguranca.
- Lote 38: solicitacoes LGPD.
- Lote 39: geocodificacao simulada.
- Lote 40: previa de e-mail.
- Lote 41: previa de WhatsApp.
- Lote 42: previa de push.
- Lote 43: catalogo de servicos.
- Lote 44: tabelas de preco.
- Lote 45: KPIs executivos.
- Lote 46: reembolso de KM.
- Lote 47: repasse para tecnicos.
- Lote 48: renovacao de contratos.
- Lote 49: saude do cliente.
- Lote 50: depreciacao de equipamentos.
- Lote 51: treinamento operacional.
- Lote 52: importacao de manuais.
- Lote 53: plano de backup.
- Lote 54: playbooks de incidentes.

## 0.8.0 - Suite De Aceleracao

- Adicionada suite com 99 contratos de lotes futuros.
- Criadas rotas para listar, executar um lote e executar todos os lotes.
- Painel web passou a acionar a execucao dos 99 lotes.
- Teste automatizado garante que os lotes 55 a 153 estao conectados.
- PDFs mantidos adiados para ganhar velocidade.

## 0.8.1 - Diagnostico De Plataforma

- Adicionado endpoint de prontidao operacional.
- Adicionado catalogo de modulos e maturidade.
- Adicionada matriz inicial de papeis e permissoes.
- Adicionado diagnostico tecnico de ambiente.
- Painel web passou a consultar diagnostico consolidado.

## 0.8.2 - Homologacao E Observabilidade

- Adicionado catalogo de contratos principais de API.
- Adicionados cenarios de homologacao operacional.
- Adicionada execucao auditavel de cenario de homologacao.
- Adicionado resumo de observabilidade local.
- Adicionado snapshot de dados de demonstracao.
- Painel web passou a executar verificacao de homologacao.
