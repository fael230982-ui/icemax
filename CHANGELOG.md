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
