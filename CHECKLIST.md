# Checklist Operacional

Este checklist deve ser revisado antes de push, homologacao e release.

## Antes De Push

- [ ] Revisar texto, acentuacao e experiencia do usuario.
- [ ] Conferir se nao ha segredos, chaves, tokens ou credenciais.
- [ ] Confirmar que arquivos `.env` reais nao foram adicionados.
- [ ] Executar validacao minima aplicavel.
- [ ] Atualizar `CHANGELOG.md` quando houver alteracao relevante.
- [ ] Preservar autoria nos documentos do projeto.

## Antes De Homologacao

- [ ] Executar typecheck.
- [ ] Executar build aplicavel.
- [ ] Executar testes aplicaveis.
- [ ] Validar fluxo principal manualmente.
- [ ] Conferir telas em desktop e mobile quando houver interface.
- [ ] Conferir regras multiempresa e permissoes quando houver back-end.

## Antes De Release

- [ ] Atualizar versao.
- [ ] Atualizar `CHANGELOG.md`.
- [ ] Revisar licenca e autoria.
- [ ] Validar que nenhum segredo foi publicado.
- [ ] Confirmar backup ou rollback quando houver banco de dados.
- [ ] Registrar data, responsavel e escopo da release.

## Registro Do Lote 1

- [x] Typecheck executado em todos os workspaces.
- [x] Build do painel web executado.
- [x] Prisma Client gerado.
- [x] Auditoria de dependencias de producao executada sem vulnerabilidades.
- [x] Repositorio remoto `origin` configurado localmente.
- [ ] Push inicial pendente.
- [x] E-mail correto de autoria confirmado e registrado.

## Registro Do Lote 2

- [x] Autoria local configurada com `RAFAEL DA SILVA BEZEERA`.
- [x] E-mail local configurado com `adm.rcsolutions@gmail.com`.
- [x] Contratos recorrentes documentados.
- [x] Schema Prisma atualizado para contratos.
- [x] Prisma Client gerado.
- [x] Typecheck executado em todos os workspaces.
- [x] Build do painel web executado.
- [x] Auditoria de dependencias de producao executada sem vulnerabilidades.
- [ ] Push inicial pendente.

## Registro Do Lote 3

- [x] Mapas interativos e plantas documentados.
- [x] Gerador de etiquetas QR documentado.
- [x] Schema Prisma atualizado com plantas, pontos e etiquetas QR.
- [x] API mockada atualizada com `/floor-plans` e `/qr-labels`.
- [x] Painel web atualizado com cards de mapas e QR.
- [x] Prisma Client gerado.
- [x] Typecheck executado em todos os workspaces.
- [x] Build do painel web executado.
- [x] Auditoria de dependencias de producao executada sem vulnerabilidades.
- [ ] Push inicial pendente.

## Registro Do Lote 4

- [x] Escopo completo documentado alem do MVP.
- [x] Pendencias do cliente documentadas em `docs/09-pendencias-do-cliente.md`.
- [x] Schema Prisma ampliado com orcamentos, checklists, estoque, manuais, IA, notificacoes e auditoria.
- [x] SQL conceitual atualizado.
- [x] API mockada ampliada.
- [x] Painel web ampliado.
- [x] App tecnico ampliado.
- [x] Ambiente local documentado.
- [x] Prisma Client gerado.
- [x] Typecheck executado em todos os workspaces.
- [x] Build do painel web executado.
- [x] Auditoria de dependencias de producao executada sem vulnerabilidades.
- [ ] Push inicial pendente.

## Registro Do Lote 5

- [x] WhatsApp incluido no escopo.
- [x] Integracoes externas documentadas.
- [x] Schema Prisma atualizado com configuracoes e eventos de integracao.
- [x] API mockada atualizada com WhatsApp e integracoes.
- [x] Referencias publicas de mercado documentadas sem copia de material proprietario.
- [x] Modelos operacionais iniciais criados.
- [x] Prisma Client gerado.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Auditoria de dependencias de producao executada.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 6

- [x] Seed inicial criado com dados ficticios.
- [x] Script `db:seed` criado.
- [x] Script `validate` criado.
- [x] API organizada por dominio.
- [x] Documentacao local atualizada.
- [x] Prisma Client gerado.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [ ] Auditoria de dependencias pendente de resolucao antes de release.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 7

- [x] Cliente de API do painel criado.
- [x] Helper de dados locais criado.
- [x] Estrategia frontend/API documentada.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 8

- [x] Gerador de PDF criado.
- [x] Script `docs:pdf` criado.
- [x] PDFs dos documentos gerados.
- [x] API preparada para alternar mock/Prisma em dashboard e ordens.
- [x] Contexto de autenticacao simulado criado.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 9

- [x] Repositorios de clientes, equipamentos e contratos criados.
- [x] Rotas de clientes e equipamentos criadas.
- [x] Contratos preparados para mock/Prisma.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 10

- [x] Painel web refatorado em componentes.
- [x] Secoes de clientes e equipamentos adicionadas.
- [x] API de orcamentos, estoque e checklists preparada para mock/Prisma.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 11

- [x] App mobile refatorado em componentes.
- [x] Dados locais do mobile separados.
- [x] Secoes operacionais do app ampliadas.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 12

- [x] Validadores de entrada criados.
- [x] POST de clientes criado.
- [x] POST de equipamentos criado.
- [x] POST de OS criado.
- [x] POST de contratos criado.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 13

- [x] Endpoint de notas da OS criado.
- [x] Endpoint de fotos da OS criado.
- [x] Endpoint de checklist da OS criado.
- [x] Endpoint de pecas usadas criado.
- [x] Endpoint de status da OS criado.
- [x] Endpoint de orcamento por OS criado.
- [x] Fluxo de execucao de OS adicionado ao painel e app.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 14

- [x] Endpoint de criacao de pecas criado.
- [x] Endpoints de locais de estoque criados.
- [x] Endpoint de movimentacao de estoque criado.
- [x] Atualizacao transacional de saldo adicionada para Prisma.
- [x] Endpoint de geracao de visitas de contrato criado.
- [x] Endpoint de OS a partir de visita de contrato criado.
- [x] Endpoints de templates de notificacao criados.
- [x] Endpoint de atualizacao de integracao criado.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 15

- [x] Dependencias seguras de auth instaladas.
- [x] Login com argon2 criado.
- [x] JWT com jose criado.
- [x] Rota `/auth/login` criada.
- [x] Rota `/auth/me` criada.
- [x] Seed atualizado com senha hash.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 16

- [x] Camada local de arquivos criada.
- [x] Gerador HTML de relatorio de OS criado.
- [x] Endpoint de relatorio de OS criado.
- [x] Rota local de arquivos criada.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 17

- [x] Docker verificado.
- [x] Indisponibilidade de Docker documentada.
- [x] Alternativa com PostgreSQL remoto documentada.
- [x] Cliente API do painel expandido para login e criacao.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 18

- [x] UI de login adicionada ao painel.
- [x] Acoes rapidas de criacao adicionadas.
- [x] Relatorio de OS em PDF/fallback HTML adicionado.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 19

- [x] Endpoint de aprovacao/recusa de orcamento criado.
- [x] Endpoint de envio simulado de notificacao criado.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 20

- [x] Factory de app da API criada.
- [x] Testes de health/dashboard criados.
- [x] Testes de criacao de entidades criados.
- [x] Testes de execucao de OS criados.
- [x] Testes de contratos/estoque/notificacao/orcamento criados.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Testes executados.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 21

- [x] Upload local de arquivos criado.
- [x] Gerador de etiqueta QR em SVG criado.
- [x] Auditoria operacional criada.
- [x] Filtros de OS adicionados.
- [x] Console operacional conectado no painel.
- [x] Base de offline queue criada no app mobile.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Testes executados.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 22

- [x] Endpoint de localizacao da equipe criado.
- [x] Endpoint de envio de localizacao do tecnico criado.
- [x] Endpoint de otimizacao de rota criado.
- [x] Console web conectado a despacho e rotas.
- [x] App mobile adiciona localizacao na fila offline.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Testes executados.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.

## Registro Do Lote 23

- [x] Endpoint local de revisao de texto criado.
- [x] Endpoint local de sugestao de causas criado.
- [x] Console web conectado a IA operacional.
- [x] Testes de IA adicionados.
- [x] PDFs dos documentos gerados.
- [x] Typecheck executado.
- [x] Testes executados.
- [x] Build do painel web executado.
- [x] Commit local criado.
- [ ] Push inicial pendente.
