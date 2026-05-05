# Changelog

Todas as alteracoes relevantes deste projeto devem ser registradas aqui antes de releases, homologacoes ou publicacoes importantes.

## 0.8.9 - Despacho Inteligente

- Adicionado endpoint de recomendacao de tecnico por OS.
- Score passou a considerar prioridade, status do tecnico, distancia estimada e vinculo atual.
- Console web passou a consultar recomendacoes de despacho.
- Teste automatizado cobre recomendacoes de equipe.

## 0.8.10 - Prontidao De Despacho Da OS

- Adicionado endpoint de prontidao antes do deslocamento do tecnico.
- Prontidao passou a verificar rota, pecas provaveis, manual, localizacao e historico.
- Console web passou a consultar a prontidao de uma OS.
- Teste automatizado cobre checks de prontidao.

## 0.8.11 - Revisao De Conclusao Da OS

- Adicionado endpoint de revisao antes do fechamento da OS.
- Revisao passou a validar texto, fotos, assinatura, equipamento e contato do cliente.
- Criado rascunho profissional de relatorio com assistente local.
- Console web passou a consultar a revisao de conclusao.

## 0.8.12 - Pos-Atendimento

- Adicionado endpoint de plano de pos-atendimento por OS.
- Plano passou a sugerir comunicacao, garantia, pesquisa de satisfacao, follow-up e proximas acoes comerciais.
- Console web passou a consultar o plano de pos-atendimento.
- Teste automatizado cobre o plano pos-OS.

## 0.8.13 - Oportunidade De Contrato

- Adicionado endpoint para converter OS em oportunidade de contrato recorrente.
- Recomendacao passou a sugerir recorrencia de 3, 4 ou 6 meses conforme risco da OS.
- Console web passou a consultar oportunidade comercial por OS.
- Teste automatizado cobre sugestao de contrato trimestral para urgencia.

## 0.8.14 - Proposta De Contrato

- Adicionado endpoint para gerar proposta comercial de contrato a partir da OS.
- Proposta inclui valores estimados, escopo, exclusoes, SLA comercial e fluxo de aceite.
- Criados textos prontos para e-mail e WhatsApp.
- Console web passou a consultar proposta comercial por OS.
- Teste automatizado cobre termos comerciais e mensagem ao cliente.

## 0.8.15 - Ativacao De Contrato

- Adicionado endpoint para preparar ativacao de contrato a partir da OS.
- Plano de ativacao inclui rascunho do contrato, calendario preventivo e primeira OS preventiva.
- Criadas etapas de aceite, governanca e comunicacao ao cliente.
- Console web passou a consultar ativacao de contrato.
- Teste automatizado cobre calendario inicial e rascunho de OS preventiva.

## 0.8.16 - Aceite De Contrato

- Adicionado endpoint para pacote de aceite de contrato a partir da OS.
- Pacote inclui documento de aceite, checks obrigatorios, handoff operacional e mensagens ao cliente.
- Console web passou a consultar aceite de contrato.
- Teste automatizado cobre checks obrigatorios e texto de aceite.

## 0.8.17 - Encerramento Do Dia

- Adicionado endpoint de snapshot executivo de encerramento do dia.
- Snapshot resume blocos concluidos, cobertura por modulo, validacao, dependencias e proximos blocos.
- Console web passou a incluir o snapshot no diagnostico.
- Teste automatizado cobre projeto, autorizacao de push e proximos blocos.

## 0.8.18 - Ativacao Real De Contrato

- Adicionado endpoint para ativar contrato a partir do aceite da OS.
- Fluxo mock simula contrato, visitas preventivas, primeira OS e auditoria.
- Fluxo Prisma prepara transacao para criar contrato, visitas, primeira OS e audit log.
- Console web passou a acionar ativacao de contrato aceito.
- Teste automatizado cobre entidades criadas na ativacao.

## 0.8.19 - Mobile Pacote Offline De OS

- Aplicativo mobile passou a enfileirar pacote completo de execucao offline.
- Pacote inclui localizacao, check-in, checklist, fotos, peca usada e assinatura.
- Painel de sincronizacao mobile passou a exibir quantidade de acoes pendentes.
- Servico mobile ganhou criadores de acoes offline reutilizaveis.

## 0.8.20 - Planta Operacional

- Adicionado endpoint de visao operacional de planta.
- Planta passou a retornar pontos com QR, manual, historico, risco e proximas acoes.
- Console web passou a consultar planta operacional.
- Teste automatizado cobre pontos e payload QR da planta.

## 0.8.21 - Financeiro De Contrato

- Adicionado endpoint de plano financeiro de contrato.
- Plano inclui valor mensal, valor anual, regras de vencimento e 12 mensalidades.
- Console web passou a consultar financeiro do contrato.
- Teste automatizado cobre mensalidades e regra de vencimento.

## 0.8.22 - Comunicacao Operacional

- Adicionados pacotes de comunicacao para OS concluida e contrato recorrente.
- Pacotes incluem e-mail, WhatsApp, avisos internos, anexos, governanca LGPD e bloqueios.
- Console web passou a consultar comunicacao da OS e comunicacao do contrato.
- Teste automatizado cobre canais, templates e regra de auditoria.

## 0.8.23 - Comando Do Dia

- Adicionado endpoint de cockpit operacional diario.
- Cockpit consolida OS urgentes, despacho, contratos, estoque, comunicacoes e decisoes do gestor.
- Console web passou a consultar o comando do dia.
- Teste automatizado cobre resumo, despacho e comunicacoes do cockpit.

## 0.8.24 - Fila De Comunicacao

- Adicionados endpoints para criar fila mock de comunicacao da OS e do contrato.
- Fila inclui canal, provedor pendente, idempotencia, tentativas, prioridade e preflight.
- Console web passou a criar filas de comunicacao para OS e contrato.
- Teste automatizado cobre fila, idempotencia e pendencia de chave externa.

## 0.8.25 - Acompanhamento Do Cliente

- Adicionado endpoint publico controlado para acompanhamento da OS pelo cliente.
- Link retorna status, etapa, tecnico, ETA, linha do tempo e acoes do cliente.
- Dados financeiros, notas internas e telefone pessoal do tecnico ficam ocultos.
- Console web passou a consultar acompanhamento de OS do cliente.
- Teste automatizado cobre privacidade, linha do tempo e refresh.

## 0.8.26 - Link Compartilhavel De OS

- Adicionado endpoint para gerar pacote de link publico de acompanhamento da OS.
- Pacote inclui token mock, URL publica, validade, canais de envio e mensagens prontas.
- Regras de seguranca indicam expiracao, revogacao e ocultacao de dados sensiveis.
- Console web passou a gerar link de acompanhamento.
- Teste automatizado cobre token, validade, WhatsApp e privacidade.

## 0.8.27 - Pagina Publica De Acompanhamento

- Adicionada rota web `/acompanhamento/[token]` para o link publico da OS.
- Pagina exibe status, cliente, equipamento, tecnico, previsao, linha do tempo e orientacoes.
- Layout foi criado com regras de privacidade visiveis e responsividade mobile.
- Build web passou a validar a nova rota dinamica.

## 0.8.28 - Portal Publico Do Cliente

- Adicionada rota web `/portal/[tenantSlug]` para abertura publica e opcional de OS.
- Formulario whitelabel coleta cliente, contato, endereco, equipamento, urgencia, descricao e aceite de WhatsApp.
- Tela exibe estados de envio, sucesso e erro sem depender da API durante o build.
- Documentacao do portal publico foi criada.

## 0.8.29 - Triagem Publica De OS

- Adicionado endpoint `POST /customer-portal/triage` para classificar solicitacoes publicas.
- Abertura publica de OS passou a retornar pacote de triagem com prioridade sugerida, checklist, orientacoes e SLA.
- Portal web passou a exibir resumo de triagem apos protocolo criado.
- Teste automatizado cobre prioridade emergencial, revisao por supervisor e checklist de triagem.

## 0.8.30 - Anexos Publicos De OS

- Adicionado endpoint `POST /customer-portal/service-orders/:id/attachments` para manifestos de fotos e documentos.
- Manifesto separa fotos e documentos, prepara hints para IA visual e registra regras de privacidade.
- Console web passou a acionar um pacote mock de anexos do portal.
- Teste automatizado cobre fotos, documentos, preparo para IA e antivirus obrigatorio antes do storage.

## 0.8.31 - Diagnostico Visual Assistido

- Adicionado endpoint `POST /ai/visual-diagnosis-package` para combinar descricao, sintomas e pistas de fotos.
- Pacote retorna causas provaveis, riscos, pecas provaveis, testes de campo e orientacao de seguranca.
- Console web passou a acionar diagnostico visual assistido por regras locais.
- Teste automatizado cobre pacote de diagnostico, risco de serpentina congelada e testes tecnicos.

## 0.8.32 - Preparo Inteligente Da Visita

- Adicionado endpoint `POST /dispatch/visit-preparation` para montar pacote antes do deslocamento.
- Pacote combina prontidao de despacho, rota, pecas provaveis, diagnostico assistido, checklist e decisao de despacho.
- Console web passou a acionar o preparo da visita.
- Teste automatizado cobre checklist, diagnostico, status de preparo e proximas acoes para o app mobile.

## 0.8.33 - Preparo Offline No Mobile

- App mobile passou a exibir secao de preparo da visita com despacho, rota, pecas, diagnostico, seguranca e cliente.
- Modo offline passou a ter acao de confirmacao do preparo recebido pelo tecnico.
- Servico mobile criou payload de confirmacao para `POST /dispatch/visit-preparation`.
- Fluxo aproxima o pacote de despacho do uso real em campo sem depender de conexao constante.

## 0.8.34 - Reserva Operacional De Pecas

- Adicionado endpoint `POST /service-orders/:id/parts-reservation` para reservar pecas provaveis da OS.
- Reserva retorna itens, movimentacoes planejadas, alertas de estoque minimo, sugestoes de compra e impacto no despacho.
- Console web passou a acionar reserva de pecas da OS.
- Teste automatizado cobre reserva, movimentacoes e liberacao de despacho.

## 0.8.35 - Pecas Reservadas No Mobile

- App mobile passou a exibir secao de pecas reservadas para a OS.
- Modo offline ganhou acao de confirmacao de pecas carregadas pelo tecnico.
- Servico mobile criou payload offline para `POST /service-orders/:id/parts-reservation`.
- Fluxo aproxima estoque, despacho e execucao de campo.

## 0.8.36 - Pacote Operacional De Garantia

- Adicionado endpoint `GET /service-orders/:id/warranty-package`.
- Pacote retorna termo de garantia, exclusoes, aceite do cliente e campos de assinatura.
- Console web passou a consultar garantia pronta por OS.
- Teste automatizado cobre fluxo de garantia operacional.
- Fluxo prepara emissao, envio e auditoria da garantia apos conclusao da OS.

## 0.8.37 - Garantia Offline No Mobile

- App mobile passou a exibir secao de garantia da OS.
- Modo offline ganhou acao de garantia apresentada ao cliente.
- Servico mobile cria payload para `POST /warranty-terms`.
- Fluxo aproxima tecnico, assinatura, termo de garantia e envio posterior.

## 0.8.38 - Pos-Atendimento Offline No Mobile

- App mobile passou a exibir secao de pos-atendimento.
- Modo offline ganhou acao de pesquisa de satisfacao do cliente.
- Servico mobile cria payload para `POST /satisfaction-surveys`.
- Fluxo prepara follow-up, historico e oportunidade de contrato apos a visita.

## 0.8.39 - Pacote De Manual Tecnico Por OS

- Adicionado endpoint `GET /service-orders/:id/manual-package`.
- Pacote seleciona manual provavel pelo equipamento da OS.
- Retorno inclui checklist de campo, notas de seguranca e cache offline sugerido.
- Console web passou a consultar manual tecnico da OS.
- Teste automatizado cobre selecao de manual Carrier para OS 1048.

## 0.8.40 - Manual Tecnico Offline No Mobile

- App mobile passou a exibir secao de manual tecnico da OS.
- Modo offline ganhou acao de manual consultado e cacheado.
- Servico mobile cria nota tecnica em `POST /service-orders/:id/notes`.
- Fluxo registra consulta ao manual antes da execucao em campo.

## 0.8.41 - Pacote De Aprovacao De Orcamento

- Adicionado endpoint `GET /quotes/:id/approval-package`.
- Pacote prepara link publico, mensagens, validade e opcoes de decisao.
- Governanca oculta margem interna e aponta endpoint de decisao do orcamento.
- Console web passou a consultar pacote de aprovacao.
- Teste automatizado cobre pacote de aprovacao do `quote-001`.

## 0.8.42 - Orcamento Offline No Mobile

- App mobile passou a exibir secao de orcamento da OS.
- Modo offline ganhou acao de orcamento apresentado ao cliente.
- Servico mobile registra nota em `POST /service-orders/:id/notes`.
- Fluxo aproxima tecnico, cliente e link de aprovacao quando nao ha internet.

## 0.8.43 - Portal Publico De Aprovacao De Orcamento

- Adicionada rota web publica `/orcamentos/[token]`.
- Tela exibe cliente, OS vinculada, equipamento, itens, total e validade.
- Portal separa decisao do cliente entre aprovar, solicitar revisao e recusar.
- Layout protege dados internos e prepara a integracao futura com token real.

## 0.8.44 - API Publica De Decisao De Orcamento

- Adicionado endpoint `GET /public/quotes/:token`.
- Adicionado endpoint `PATCH /public/quotes/:token/decision`.
- Token publico passa a localizar o orcamento sem expor ID interno na tela.
- Aprovacao publica exige aceite dos termos antes de alterar a decisao.
- Teste automatizado cobre consulta publica, bloqueio sem aceite e aprovacao.

## 0.8.45 - Decisao Interativa No Portal De Orcamento

- Portal publico de orcamento ganhou formulario de decisao do cliente.
- Cliente informa responsavel, documento, e-mail, observacao e aceite dos termos.
- Front-end passou a chamar `PATCH /public/quotes/:token/decision`.
- Estados de sucesso, erro e carregamento foram incluidos na experiencia.

## 0.8.46 - Carregamento Publico De Orcamento

- Pagina `/orcamentos/[token]` passou a tentar buscar dados em `GET /public/quotes/:token`.
- Fallback local mantem a demonstracao funcional quando a API nao esta online.
- Total, validade, cliente, OS e itens passam a aceitar retorno real da API.
- Rota foi marcada como dinamica para uso seguro com tokens publicos.

## 0.8.47 - Comunicacao De Orcamento

- Adicionado endpoint `GET /quotes/:id/communication-package`.
- Adicionado endpoint `POST /quotes/:id/communication-queue`.
- Pacote prepara e-mail, WhatsApp e aviso interno para aprovacao de orcamento.
- Console web passou a consultar pacote e criar fila de comunicacao do orcamento.
- Teste automatizado cobre pacote, fila e link publico de aprovacao.

## 0.8.48 - Handoff De Decisao De Orcamento

- Adicionado endpoint `GET /quotes/:id/decision-handoff`.
- Handoff orienta operacao quando o orcamento for aprovado, recusado ou ainda estiver pendente.
- Retorno inclui plano de execucao, impacto em estoque, comunicacoes e governanca.
- Console web ganhou acao para consultar handoff de orcamento.
- Teste automatizado cobre o handoff de decisao.

## 0.8.49 - Ativacao De Orcamento Aprovado

- Adicionado endpoint `POST /quotes/:id/approval-activation`.
- Ativacao prepara mudanca de status da OS, reserva de pecas, despacho e comunicacoes.
- Orcamentos pendentes ficam bloqueados para execucao operacional.
- Console web ganhou acao para ativar orcamento aprovado.
- Teste automatizado cobre ativacao bloqueada e ativacao aprovada.

## 0.8.50 - Orcamento Aprovado Offline No Mobile

- App mobile passou a exibir secao de orcamento liberado para execucao.
- Modo offline ganhou acao de aceite da liberacao do orcamento aprovado.
- SyncPanel recebeu botao `Orcamento liberado`.
- Fluxo diferencia orcamento apresentado de orcamento aprovado para execucao.

## 0.8.51 - Linha Do Tempo De Orcamento

- Adicionado endpoint `GET /quotes/:id/approval-timeline`.
- Linha do tempo consolida criacao, comunicacao, abertura, decisao e ativacao do orcamento.
- Retorno inclui metricas, pendencias, proximas acoes e governanca de auditoria.
- Console web ganhou acao para consultar a timeline do orcamento aprovado.
- Teste automatizado cobre eventos e auditoria da linha do tempo.

## 0.8.52 - Timeline De Orcamento No Mobile

- App mobile passou a exibir secao de timeline do orcamento aprovado.
- Timeline resume criacao, comunicacao, abertura, aprovacao e liberacao operacional.
- Modo offline ganhou acao para registrar consulta da timeline pelo tecnico.
- SyncPanel recebeu botao `Timeline orcamento`.

## 0.8.53 - Timeline Publica De Orcamento

- Portal publico de orcamento passou a exibir linha do tempo de acompanhamento.
- Cliente visualiza etapas concluidas e proximos passos depois da decisao.
- Estilos responsivos foram adicionados para cards de timeline no desktop e mobile.

## 0.8.54 - Board Gerencial De Orcamentos

- Adicionado endpoint `GET /quotes/approval-board`.
- Board classifica orcamentos em aguardando cliente, aprovados para execucao e revisao comercial.
- Retorno inclui SLA, validade, risco, alertas, comunicacao recomendada e proximas acoes.
- Console web ganhou acao para consultar o board gerencial de orcamentos.
- Teste automatizado cobre resumo, lanes e governanca do board.

## 0.8.55 - Board De Orcamentos No Mobile

- App mobile passou a exibir resumo de board de orcamentos para campo.
- Tecnico visualiza orcamento aprovado, pendente de cliente, SLA, risco e comunicacao autorizada.
- Modo offline ganhou acao para registrar consulta do board pelo tecnico.
- SyncPanel recebeu botao `Board orcamentos`.

## 0.8.56 - Lembretes De Aprovacao De Orcamento

- Adicionado endpoint `POST /quotes/approval-reminders`.
- Lembretes sao gerados a partir do board de orcamentos.
- Retorno prepara mensagens para cliente pendente e aviso interno para orcamento aprovado.
- Pacote inclui preflight, idempotencia, opt-in de WhatsApp e ocultacao de margem.
- Console web ganhou acao para criar lembretes de orcamento.

## 0.8.57 - Lembretes De Orcamento No Mobile

- App mobile passou a exibir secao de lembretes de orcamento.
- Tecnico visualiza orientacoes de opt-in, auditoria, privacidade e proximo passo.
- Modo offline ganhou acao para registrar lembrete apresentado em campo.
- SyncPanel recebeu botao `Lembrete orcamento`.

## 0.8.58 - Prontidao De Execucao Do Orcamento

- Adicionado endpoint `GET /quotes/:id/execution-readiness`.
- Prontidao consolida aprovacao, OS vinculada, reserva de pecas, despacho e comunicacao.
- Retorno indica se o orcamento pode executar, bloqueios, atencoes e integracoes operacionais.
- Console web ganhou acao para consultar prontidao do orcamento aprovado.
- Teste automatizado cobre checks e auditoria da prontidao.

## 0.8.59 - Prontidao De Orcamento No Mobile

- App mobile passou a exibir secao de prontidao do orcamento aprovado.
- Tecnico visualiza criterios de aceite, OS vinculada, estoque, despacho e comunicacao.
- Modo offline ganhou acao para registrar conferencia de prontidao antes da execucao.
- SyncPanel recebeu botao `Prontidao orcamento`.

## 0.8.60 - Fila De Despacho De Orcamentos Aprovados

- Adicionado endpoint `GET /dispatch/quote-execution-queue`.
- Fila conecta orcamentos aprovados, prontidao da OS, tecnico recomendado e rota.
- Painel web ganhou acao `Fila orcamentos aprovados`.
- Teste automatizado cobre a fila de despacho para orcamentos aprovados.

## 0.8.61 - Fila De Despacho No Mobile

- App mobile passou a exibir secao de fila de despacho para orcamento aprovado.
- Modo offline ganhou acao para registrar ciencia do tecnico sobre a fila.
- SyncPanel recebeu botao `Fila despacho`.
- Documentado fluxo mobile em `docs/92-fila-despacho-mobile.md`.

## 0.8.62 - Aceite E Reatribuicao De Tecnico

- Adicionado endpoint `POST /dispatch/assignment-decision`.
- Tecnico pode aceitar, recusar ou pedir apoio para uma atribuicao de OS.
- Resposta inclui impacto no despacho, auditoria e plano de reatribuicao quando houver recusa.
- Painel web ganhou acao `Aceite tecnico`.
- Teste automatizado cobre aceite da atribuicao.

## 0.8.63 - Comunicacao De Deslocamento

- Adicionado endpoint `GET /dispatch/service-orders/:id/departure-communication`.
- Pacote prepara mensagens de WhatsApp, e-mail e comunicacao interna para tecnico a caminho.
- Incluidas regras de privacidade, opt-in, preflight de prontidao e auditoria.
- Painel web ganhou acao `Aviso deslocamento`.
- Teste automatizado cobre pacote de comunicacao de saida.

## 0.8.64 - Acompanhamento De Rota

- Adicionado endpoint `GET /dispatch/service-orders/:id/route-tracking`.
- Snapshot consolida posicao do tecnico, destino, ETA, timeline e alertas.
- Painel web ganhou acao `Acompanhar rota`.
- Teste automatizado cobre acompanhamento de rota mockado.
- Fluxo permanece independente de provedor real de mapas nesta fase.

## 0.8.65 - Pacote De Chegada E Check-In

- Adicionado endpoint `GET /dispatch/service-orders/:id/arrival-checkin`.
- Pacote valida proximidade, ETA, status de check-in e portoes de checklist.
- Painel web ganhou acao `Pacote chegada`.
- Teste automatizado cobre pacote de chegada.
- Fluxo prepara abertura segura da OS em campo.

## 0.8.66 - Inicio De Execucao Em Campo

- Adicionado endpoint `GET /dispatch/service-orders/:id/execution-start`.
- Pacote conecta check-in, evidencias obrigatorias, escopo aprovado e checklist inicial.
- Painel web ganhou acao `Inicio execucao`.
- Teste automatizado cobre pacote de inicio de execucao.
- Fluxo bloqueia intervencao sem check-in valido.

## 0.8.67 - Evidencias De Execucao Em Campo

- Adicionado endpoint `GET /dispatch/service-orders/:id/execution-evidence`.
- Pacote estrutura fotos obrigatorias, medicoes tecnicas, pecas usadas e observacoes.
- Incluido plano de medicoes e baixa de estoque provavel.
- Painel web ganhou acao `Evidencias campo`.
- Teste automatizado cobre pacote de evidencias.

## 0.8.68 - Fechamento De Execucao Em Campo

- Adicionado endpoint `GET /dispatch/service-orders/:id/execution-closeout`.
- Pacote inclui bloqueios, checklist de conclusao, rascunho de relatorio e gate de assinatura.
- Assinatura fica bloqueada enquanto houver evidencia obrigatoria ou baixa de estoque pendente.
- Painel web ganhou acao `Fechamento campo`.
- Teste automatizado cobre pacote de fechamento tecnico.

## 0.8.69 - Assinatura Do Cliente Em Campo

- Adicionado endpoint `GET /dispatch/service-orders/:id/customer-signature`.
- Pacote de assinatura herda bloqueios do fechamento tecnico.
- Incluidos termos, campos de captura, decisao de copia por e-mail e regras de privacidade.
- Painel web ganhou acao `Assinatura cliente`.
- Teste automatizado cobre pacote de assinatura do cliente.

## 0.8.70 - E-Mail De Conclusao Da OS

- Adicionado endpoint `GET /dispatch/service-orders/:id/completion-email`.
- Pacote prepara destinatario da empresa, copia opcional ao cliente, assunto, corpo e anexos.
- Envio fica bloqueado ate assinatura do cliente e fechamento tecnico consistente.
- Painel web ganhou acao `E-mail conclusao`.
- Teste automatizado cobre pacote de e-mail final da OS.

## 0.8.71 - Mobile Fechamento, Assinatura E E-Mail

- App mobile ganhou acoes offline para fechamento tecnico, pacote de assinatura e e-mail final.
- Painel de sincronizacao mobile recebeu botoes `Fechamento campo`, `Assinatura campo` e `E-mail conclusao`.
- App passou a exibir secoes de fechamento, assinatura e e-mail de conclusao.
- Fluxo offline registra decisao de copia ao cliente e anexos esperados.
- Documentado o caminho de evolucao para endpoints transacionais definitivos.

## 0.8.72 - Comandos De Assinatura E E-Mail Final

- Adicionados endpoints POST para registrar assinatura do cliente e enfileirar e-mail final da OS.
- Schemas passaram a validar responsavel, aceite dos termos, copia opcional e id offline.
- Mobile passou a sincronizar assinatura e e-mail final diretamente nos comandos de despacho.
- Console web ganhou acoes `Registrar assinatura` e `Enfileirar e-mail`.
- Teste automatizado cobre os comandos transacionais de assinatura e e-mail.

## 0.8.73 - Board De Finalizacao Da OS

- Adicionado endpoint `GET /dispatch/finalization-board`.
- Board resume OS por fechamento tecnico, assinatura, e-mail final e bloqueios.
- Painel web ganhou acao `Board finalizacao`.
- Governanca indica assinatura, evidencias e auditoria de e-mail como obrigatorias.
- Teste automatizado cobre o board de finalizacao.

## 0.8.74 - Board De Finalizacao No Painel Web

- Criado componente visual `FieldFinalizationBoard` no painel web.
- Board web consulta a API local e usa fallback local quando a API nao estiver ativa.
- Painel principal passou a exibir resumo, bloqueios e proxima acao por OS.
- CSS responsivo criado para a experiencia gerencial.
- Documentado o uso do board visual de finalizacao.

## 0.8.75 - Acoes Rapidas No Board De Finalizacao

- Board web de finalizacao ganhou filtros por status e busca por OS, cliente, equipamento, tecnico ou prioridade.
- API de finalizacao passou a expor `technicianUserId` para rastreabilidade das acoes.
- Painel web recebeu comandos rapidos para registrar assinatura e enfileirar e-mail final.
- Acoes usam API local quando disponivel e mantem feedback visual quando a API estiver desligada.
- Documentado o fluxo operacional do board com filtros e acoes.

## 0.8.76 - Fila Gerencial De E-Mail Final

- Adicionado endpoint `GET /dispatch/completion-email-queue`.
- Fila resume e-mails bloqueados, aguardando provedor e copias opcionais ao cliente.
- Painel web ganhou secao dedicada para fila de e-mails finais.
- Adicionado filtro para exibir apenas e-mails bloqueados.
- Teste automatizado cobre o contrato da fila de e-mail final.

## 0.8.77 - Arquivo De Fechamento Da OS

- Adicionado endpoint `GET /dispatch/service-orders/:id/closeout-archive`.
- Arquivo consolida relatorio, evidencias, assinatura, e-mail, garantia e linha do tempo.
- Painel web ganhou secao para consultar o pacote de comprovacao da OS.
- Teste automatizado cobre documentos e timeline do arquivo de fechamento.
- Documentado uso do arquivo para historico, garantia, suporte e auditoria.

## 0.8.78 - Central De Pos-Atendimento

- Adicionado endpoint `GET /service-orders/:id/post-service-command-center`.
- Central conecta garantia, pesquisa de satisfacao, follow-up tecnico e oportunidade de contrato.
- Painel web ganhou secao de pos-atendimento com tarefas por responsavel.
- Teste automatizado cobre tarefas, garantia e governanca do pos-atendimento.
- Documentado o fluxo de suporte, qualidade e comercial apos fechamento da OS.

## 0.8.79 - Esteira De Contratos Recorrentes

- Adicionado endpoint `GET /contracts/opportunity-pipeline`.
- Esteira comercial classifica oportunidades por score, etapa e contrato existente.
- Painel web ganhou secao para oportunidades recorrentes com filtros e receita estimada.
- Teste automatizado cobre o contrato da esteira e ordenacao por score.
- Documentado o fluxo comercial pos-OS para contratos recorrentes.

## 0.8.80 - Capacidade Da Agenda Recorrente

- Adicionado endpoint `GET /contracts/capacity-board`.
- Board calcula carga semanal por visitas e equipamentos cobertos.
- Painel web ganhou secao de capacidade da agenda recorrente.
- Teste automatizado cobre capacidade, semanas e governanca.
- Documentado uso operacional para preventivas, terceirizados e novas vendas.

## 0.8.81 - Faturamento Recorrente

- Adicionado endpoint `GET /billing/recurring-board`.
- Board consolida MRR, ARR, proximos vencimentos e riscos de cobranca.
- Painel web ganhou secao financeira de contratos recorrentes.
- Teste automatizado cobre resumo financeiro e governanca.
- Documentado uso do board financeiro operacional.

## 0.8.82 - Contas A Receber

- Adicionado endpoint `GET /billing/receivables-board`.
- Board separa valores em aberto, vencidos, em dia e contas criticas.
- Painel web ganhou secao de contas a receber com filtro de bloqueios.
- Teste automatizado cobre inadimplencia e bloqueio de automacao.
- Documentado uso operacional sem cobranca real ate integracao financeira.

## 0.8.83 - Regua De Cobranca

- Adicionado endpoint `GET /billing/collection-automation-board`.
- Regua cria pre-fila de e-mail, WhatsApp e aviso interno para recebiveis.
- Contas criticas bloqueiam contato automatico com cliente e exigem gestor.
- Painel web ganhou secao de regua de cobranca com filtro de bloqueios.
- Teste automatizado cobre fila mock, bloqueios e governanca.

## 0.8.84 - Portal Financeiro Do Cliente

- Adicionado endpoint `GET /customer-portal/:tenantSlug/billing-summary`.
- Portal do cliente passou a mostrar contratos, mensalidade, equipamentos e proximas visitas.
- Dados internos, margem, politica de cobranca e observacoes administrativas seguem ocultos.
- Teste automatizado cobre resumo financeiro publico e privacidade.
- Documentado limite de seguranca para identidade do cliente em producao.

## 0.8.85 - Acesso Seguro Financeiro Do Cliente

- Adicionado endpoint `POST /customer-portal/:tenantSlug/billing-access-link`.
- Criado pacote de acesso com token mock, expiracao, escopo, canais e restricoes.
- Portal do cliente ganhou acao para preparar link financeiro seguro.
- Teste automatizado cobre token, expiracao, restricoes e seguranca.
- Documentado fluxo futuro de validacao de identidade antes de dados reais.

## 0.8.86 - Politica De Acesso Do Portal

- Adicionado endpoint `GET /customer-portal/:tenantSlug/access-policy`.
- Politica separa areas publicas, links opacos e area financeira segura.
- Portal do cliente passou a mostrar zonas de acesso e requisitos de identidade.
- Teste automatizado cobre deny-by-default, zona financeira e checks de release.
- Documentado gate de acesso para evolucao segura em producao.

## 0.8.87 - Prontidao De Dados Para Prisma

- Adicionado endpoint `GET /database/data-readiness-board`.
- Board classifica dominios por prontidao, risco, cobertura de repositorio e bloqueios.
- Console operacional passou a consultar o board junto da virada para banco.
- Teste automatizado cobre media de prontidao, governanca e sequencia recomendada.
- Documentado plano de migracao por dominio antes da virada para producao.

## 0.8.88 - Gate De Isolamento Multiempresa

- Adicionado endpoint `GET /database/tenant-isolation-gate`.
- Gate informa dominios prontos, parciais e bloqueados para virada multiempresa.
- Console operacional passou a validar isolamento junto da virada para banco.
- Teste automatizado cobre bloqueio de producao enquanto houver dominio sem isolamento completo.
- Documentadas regras minimas para tenantId, portal publico, storage privado e jobs.

## 0.8.89 - Drill De Rollback Da Virada Para Banco

- Adicionado endpoint `GET /database/rollback-drill`.
- Drill organiza preflight, backup, migration, seed, smoke test e rollback.
- Comandos destrutivos ficam bloqueados como dry-run e exigem aprovacao manual.
- Console operacional passou a consultar o drill junto dos checks de banco.
- Teste automatizado cobre politica dry-run, comando de restauracao bloqueado e criterios de go/no-go.

## 0.8.90 - Prontidao De Storage Privado

- Adicionado endpoint `GET /files/storage-readiness`.
- Storage passa a expor politica de acesso, pastas, sensibilidade, retencao e bloqueios.
- Console operacional consulta prontidao de storage durante homologacao.
- Teste automatizado cobre politica deny-by-default, pastas privadas e bloqueio em modo local.
- Documentado caminho para substituir storage local por storage privado em producao.

## 0.8.91 - Manifesto De Evidencias Da OS

- Adicionado endpoint `GET /service-orders/:id/evidence-manifest`.
- Manifesto consolida fotos, relatorio, assinatura, equipamento e contato do cliente.
- Cada evidencia recebe sensibilidade, obrigatoriedade, status e politica de retencao.
- Console operacional passou a consultar manifesto junto da revisao de conclusao da OS.
- Teste automatizado cobre governanca, storage privado e total de evidencias.

## 0.8.92 - Politica De Compartilhamento Externo

- Adicionado endpoint `GET /customer-portal/:tenantSlug/external-sharing-policy`.
- Politica define canais permitidos, cargas bloqueadas e controles por e-mail, portal, link publico e WhatsApp.
- Homologacao web passou a consultar a politica junto dos demais checks.
- Teste automatizado cobre governanca, manifesto de evidencias e bloqueio de dados sensiveis em link publico.
- Documentadas regras de compartilhamento externo para relatorios, fotos, assinaturas e dados financeiros.

## 0.8.93 - Seed Prisma Idempotente

- Seed Prisma passou a usar `upsert` com IDs deterministicos nos dados base de homologacao.
- Plano `GET /database/seed-plan` agora informa estrategia idempotente e IDs principais.
- Evitada duplicacao de cliente, endereco, equipamento, OS, contrato, peca, estoque, checklist e manual em execucoes repetidas.
- Teste automatizado cobre flag de idempotencia e ID deterministico de OS.
- Documentado uso seguro do seed para homologacao repetivel.

## 0.8.94 - Smoke Test Prisma

- Adicionado endpoint `GET /database/prisma-smoke-test`.
- Smoke test consulta contagens minimas por tenant quando `API_DATA_SOURCE=prisma`.
- Em modo mock, endpoint retorna `skipped` com pre-requisitos claros para execucao real.
- Console operacional passou a consultar o smoke test junto dos checks de virada para banco.
- Teste automatizado cobre comportamento seguro em modo mock.

## 0.8.95 - Schema De Token Publico Seguro

- Adicionado modelo Prisma `PublicAccessToken` com `tokenHash`, escopo, entidade, expiracao, revogacao e auditoria de acesso.
- Tenant passou a relacionar tokens publicos para portal, acompanhamento, financeiro e orcamentos.
- Seed idempotente cria token publico de desenvolvimento apenas com hash nao secreto.
- Schema summary passou a incluir dominio `portal_cliente`.
- Smoke test Prisma passou a verificar tokens publicos por tenant.

## 0.8.96 - Servico De Token Publico

- Adicionado servico de emissao de tokens publicos opacos com entropia forte.
- Links de acompanhamento da OS e resumo de contrato passaram a expor apenas token cru no momento de criacao.
- Repositorio Prisma persiste somente hash SHA-256 com pepper de servidor, escopo, entidade, expiracao e metadados seguros.
- Portal do cliente ganhou endpoint de politica de token publico.
- Teste automatizado cobre hash preview, escopo, expiracao e garantia de que token cru nao e persistido.

## 0.8.97 - Validacao De Link Publico

- Adicionado endpoint `GET /public/customer-portal/tokens/:token/validate`.
- Validacao confere escopo esperado, entidade, tenant e status ativo em mock ou Prisma.
- Aberturas de token publico passaram a registrar auditoria com resultado e motivo.
- Teste automatizado cobre token valido de contrato, token valido de acompanhamento e bloqueio por escopo incorreto.
- Documentado fluxo de validacao de link publico antes de exibir dados do cliente.

## 0.8.98 - Acompanhamento Web Validado

- Pagina publica `/acompanhamento/[token]` passou a validar o token na API antes de exibir dados.
- Front-end passou a buscar o acompanhamento da OS pela entidade retornada pela validacao.
- Quando o token falha, a pagina mantem dados sensiveis protegidos e exibe estado indisponivel.
- Cliente, equipamento, tecnico, ETA, linha do tempo e orientacoes agora vêm da API quando o link e valido.
- Documentado comportamento esperado da tela publica de acompanhamento.

## 0.8.99 - Portal Financeiro Validado

- Pagina publica `/portal/[tenantSlug]` passou a ler `billingToken` ou `token` da URL.
- Resumo financeiro de contratos passou a exigir validacao de token com escopo `billing_summary`.
- Sem token valido, contratos, valores e vencimentos ficam protegidos.
- Estado visual informa link necessario, link validado ou link invalido.
- Documentado controle de acesso financeiro para o portal do cliente.

## 0.8.100 - Revogacao De Token Publico

- Adicionado endpoint `POST /customer-portal/public-tokens/:token/revoke`.
- Revogacao exige escopo explicito para evitar desligamento acidental de outro tipo de link.
- Em Prisma, a revogacao grava `revokedAt` no `PublicAccessToken`.
- Em mock, a revogacao retorna pacote auditavel sem persistir token cru.
- Teste automatizado cobre revogacao valida e tentativa com escopo incorreto.

## 0.8.101 - Inventario De Tokens Publicos

- Adicionado endpoint `GET /customer-portal/public-tokens`.
- Listagem permite filtrar por escopo, tipo de entidade, entidade e status.
- Mock passou a manter indice seguro de tokens emitidos sem armazenar token cru.
- Validacao mock agora respeita tokens revogados quando eles foram emitidos pela API.
- Teste automatizado cobre listagem, resumo ativo/revogado e garantia de que token cru nao aparece.

## 0.8.102 - Inventario De Links No Console

- Cliente web passou a consultar `GET /customer-portal/public-tokens`.
- Console operacional ganhou acao para visualizar inventario de links publicos.
- Operacao passa a enxergar links ativos, revogados e expirados pelo painel.
- A listagem preserva a regra de nunca mostrar token cru.
- Documentada a conexao do inventario de links ao console web.

## 0.8.103 - Revogacao De Link Por Registro

- Adicionado endpoint `POST /customer-portal/public-token-records/:id/revoke`.
- Operacao pode revogar link pelo ID listado no inventario sem conhecer token cru.
- Mock e Prisma passam a suportar revogacao administrativa por registro.
- Auditoria diferencia revogacao por token e revogacao por registro.
- Teste automatizado cobre revogacao de link financeiro ativo pelo ID do inventario.

## 0.8.104 - Revogacao De Link No Console

- Cliente web passou a chamar `POST /customer-portal/public-token-records/:id/revoke`.
- Console operacional ganhou formulario para revogar link publico pelo ID do inventario.
- Operacao administrativa revoga sem expor token cru ou URL completa.
- Estado do painel impede envio sem ID preenchido.
- Documentado fluxo de revogacao operacional pelo console web.

## 0.8.105 - Motivo De Revogacao De Link

- Revogacao por registro passou a aceitar motivo operacional validado.
- Console web exige motivo antes de revogar link publico.
- Mock e Prisma preservam `revocationReason` nos metadados do token.
- Auditoria registra o motivo junto da revogacao.
- Teste automatizado cobre motivo em revogacao de link financeiro.

## 0.8.106 - Inventario Visual De Links

- Console web passou a renderizar tabela de links publicos apos consulta ao inventario.
- Tabela mostra escopo, entidade, status e preview seguro do hash.
- Cada linha ativa pode ser revogada diretamente sem expor token cru.
- Inventario e recarregado apos revogacao pela tabela.
- Estilos responsivos adicionados para leitura operacional.

## 0.8.107 - Filtros E Confirmacao De Links Publicos

- Inventario visual ganhou filtros por status e escopo.
- Painel passou a exibir resumo de ativos, revogados, expirados e total.
- Revogacao manual e por linha agora exige confirmacao do operador.
- Recarregamento apos revogacao preserva filtros selecionados.
- Documentado fluxo operacional com filtros e confirmacao.

## 0.8.8 - Calendario De Contratos Recorrentes

- Adicionado endpoint de calendario de manutencoes contratadas.
- Calendario passou a classificar visitas como vencidas, proximas ou planejadas.
- Console web passou a consultar o calendario de contratos.
- Teste automatizado cobre o resumo de visitas futuras.

## 0.8.7 - Prontidao Do Repositorio

- Adicionado comando `npm run readiness` para checar arquivos, scripts, CI, variaveis e pendencias de publicacao.
- Documentada a leitura do relatorio local de prontidao.
- README passou a listar a checagem de prontidao.

## 0.8.6 - Protecao Contra Segredos

- Adicionado guard local para bloquear arquivos `.env` reais e padroes comuns de chaves.
- `npm run validate` passou a executar a verificacao contra segredos antes de typecheck, testes e build.
- Documentado processo de trabalho seguro com chaves e tokens.

## 0.8.5 - Governanca GitHub E Publicacao

- Adicionado workflow de CI para validar pull requests e pushes na branch `main`.
- Adicionado template de pull request com checklist de validacao e governanca.
- Adicionados templates de issue para bugs e novas funcionalidades.
- Documentado processo de publicacao controlada no GitHub.
- README atualizado com estrutura real do monorepo e scripts atuais.
- PDFs mantidos adiados para ganhar velocidade.

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

## 0.8.3 - Transicao Para Banco Real

- Adicionado plano de virada de mock para Prisma/PostgreSQL.
- Adicionado resumo de dominios do schema Prisma.
- Adicionado plano de seed inicial.
- Adicionado checklist de variaveis de ambiente.
- Painel web passou a consultar diagnostico de virada para banco.

## 0.8.4 - Gate De Pre-Release

- Adicionado endpoint de semaforo pre-release.
- Gate passou a checar banco, fonte de dados, JWT, integracoes e validacao.
- Console web passou a incluir gate no diagnostico.
