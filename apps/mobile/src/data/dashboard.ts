export const orders = [
  { id: "#1048", customer: "ClimaSul Hotel", status: "Em atendimento", detail: "Sem refrigeracao", priority: "Emergencia" },
  { id: "#1050", customer: "Clinica Vida", status: "Em rota", detail: "Preventiva trimestral", priority: "Normal" },
  { id: "#1051", customer: "Mercado Avante", status: "Agendada", detail: "Dreno vazando", priority: "Alta" },
];

export const tools = [
  { title: "Checklist", detail: "Itens obrigatorios por servico" },
  { title: "QR Code", detail: "Abrir ficha do equipamento" },
  { title: "Manuais", detail: "Consulta por marca e modelo" },
  { title: "Pecas", detail: "Baixa e solicitacao em campo" },
  { title: "WhatsApp", detail: "Enviar link ao cliente" },
  { title: "Check-in/out", detail: "Registrar chegada e saida" },
];

export const contracts = [
  { customer: "Clinica Vida", due: "12/05/2026", cycle: "3 meses" },
  { customer: "ClimaSul Hotel", due: "20/05/2026", cycle: "4 meses" },
];

export const quality = [
  { title: "KM", value: "36 km hoje" },
  { title: "Satisfacao", value: "Pesquisa apos OS" },
  { title: "Offline", value: "Sincronizacao pendente: 0" },
  { title: "Fotos", value: "Obrigatorias por checklist" },
];

export const visitPreparation = [
  { title: "Despacho", detail: "OS 1048 exige aprovacao gerencial por emergencia" },
  { title: "Rota", detail: "Tecnico Rafael Martins, 12 min estimados ate o cliente" },
  { title: "Pecas", detail: "R410A e capacitor 45uF devem ser conferidos antes da saida" },
  { title: "Diagnostico", detail: "Possivel baixa vazao, filtro obstruido ou carga de fluido" },
  { title: "Seguranca", detail: "Confirmar acesso e registrar fotos antes de intervir" },
  { title: "Cliente", detail: "Enviar aviso de deslocamento quando pacote for liberado" },
];

export const reservedParts = [
  { title: "R410A", detail: "1 un reservada no almoxarifado para carregar no veiculo" },
  { title: "CAP-45", detail: "1 capacitor 45uF reservado; conferir estoque minimo apos retirada" },
  { title: "Movimento", detail: "Transferencia planejada: Almoxarifado -> Veiculo Rafael" },
  { title: "Compra", detail: "Se consumo for confirmado, revisar reposicao automatica" },
];

export const warrantyPackage = [
  { title: "Cobertura", detail: "90 dias para mao de obra e pecas fornecidas nesta OS" },
  { title: "Exclusoes", detail: "Mau uso, terceiros, oscilacao eletrica e infraestrutura preexistente" },
  { title: "Aceite", detail: "Cliente deve declarar ciencia das condicoes e orientacoes tecnicas" },
  { title: "Envio", detail: "Termo sera enviado por e-mail com copia opcional ao cliente" },
];

export const postService = [
  { title: "Pesquisa", detail: "Cliente avalia atendimento apos assinatura da OS" },
  { title: "Follow-up", detail: "Retorno em 2 dias para confirmar estabilidade do equipamento" },
  { title: "Contrato", detail: "Verificar oportunidade de preventiva recorrente" },
  { title: "Historico", detail: "Atualizar ficha do cliente e do equipamento" },
];

export const manualPackage = [
  { title: "Carrier 60k", detail: "Manual provavel: Carrier Piso Teto 60.000 BTUs" },
  { title: "Cache", detail: "Baixar manual antes do deslocamento para consulta offline" },
  { title: "Seguranca", detail: "Desenergizar equipamento antes de acessar componentes internos" },
  { title: "Etiqueta", detail: "Conferir modelo real no QR Code ou placa de identificacao" },
];

export const quoteApproval = [
  { title: "ORC-2026-001", detail: "R$ 1840.00 para diagnostico e reposicao de fluido" },
  { title: "Link", detail: "Apresentar link de aprovacao ao responsavel no local" },
  { title: "Validade", detail: "Orcamento valido ate 10/05/2026" },
  { title: "Decisao", detail: "Aprovado libera execucao, recusado retorna para revisao comercial" },
];

export const approvedQuoteActivation = [
  { title: "ORC-2026-002", detail: "Orcamento aprovado e liberado para execucao da OS 1049" },
  { title: "OS", detail: "Status alvo: agendada, com escopo aprovado pelo cliente" },
  { title: "Pecas", detail: "Separar itens aprovados antes do deslocamento tecnico" },
  { title: "Despacho", detail: "Revalidar prontidao, rota e janela do cliente antes da saida" },
  { title: "Cliente", detail: "Avisar que a equipe seguira com a programacao do atendimento" },
  { title: "Auditoria", detail: "Registrar aceite e ativacao do orcamento na sincronizacao" },
];

export const quoteApprovalTimeline = [
  { title: "Criado", detail: "ORC-2026-002 gerado e vinculado a OS 1049" },
  { title: "Comunicado", detail: "Link publico, e-mail, WhatsApp e aviso interno preparados" },
  { title: "Aberto", detail: "Cliente acessou o portal publico do orcamento" },
  { title: "Aprovado", detail: "Aceite registrado com termos comerciais e escopo aprovado" },
  { title: "Liberado", detail: "Execucao operacional pronta para despacho e acompanhamento" },
  { title: "Proximo", detail: "Tecnico deve conferir pecas, rota e janela antes da saida" },
];

export const quoteApprovalBoard = [
  { title: "Aprovado", detail: "ORC-2026-002 esta liberado para execucao da OS 1049" },
  { title: "Aguardando", detail: "ORC-2026-001 ainda depende de decisao do cliente" },
  { title: "SLA", detail: "Pendentes devem receber lembrete autorizado antes do vencimento" },
  { title: "Risco", detail: "Nao executar servico fora do escopo aprovado" },
  { title: "Comunicacao", detail: "Usar WhatsApp ou e-mail apenas conforme autorizacao do cliente" },
  { title: "Gestor", detail: "Aprovados devem ir para despacho, recusados voltam ao comercial" },
];

export const quoteApprovalReminders = [
  { title: "Cliente", detail: "Lembrete do ORC-2026-001 deve respeitar opt-in de WhatsApp" },
  { title: "Interno", detail: "ORC-2026-002 aprovado deve acionar despacho e conferencia de pecas" },
  { title: "Duplicidade", detail: "Evitar reenvio repetido usando controle de idempotencia" },
  { title: "Auditoria", detail: "Registrar quem orientou o cliente e quando a mensagem foi apresentada" },
  { title: "Privacidade", detail: "Nao comentar margem, custo interno ou dados sensiveis no atendimento" },
  { title: "Proximo", detail: "Se cliente aprovar, ativar execucao; se pedir revisao, acionar comercial" },
];

export const quoteExecutionReadiness = [
  { title: "Status", detail: "ORC-2026-002 pronto para executar apos aceite, OS vinculada e pecas conferidas" },
  { title: "Cliente", detail: "Confirmar que o responsavel recebeu aviso de programacao antes do deslocamento" },
  { title: "Estoque", detail: "Itens aprovados devem estar reservados ou carregados no veiculo" },
  { title: "Despacho", detail: "Nao iniciar servico fora do escopo aprovado sem nova autorizacao" },
  { title: "Auditoria", detail: "Registrar conferencias feitas pelo tecnico antes da execucao" },
  { title: "Bloqueio", detail: "Pendencias de aceite, estoque, rota ou comunicacao impedem execucao imediata" },
];

export const quoteExecutionDispatchQueue = [
  { title: "Fila", detail: "ORC-2026-002 entrou na fila de despacho da OS 1049" },
  { title: "Tecnico", detail: "Joao Pereira recomendado para atendimento com rota validada" },
  { title: "Rota", detail: "Deslocamento deve ser confirmado antes da saida e recalculado se a agenda mudar" },
  { title: "Cliente", detail: "Confirmar janela e responsavel no local antes de iniciar deslocamento" },
  { title: "Bloqueios", detail: "Se houver peca, aceite ou prontidao pendente, manter OS sem execucao" },
  { title: "Mobile", detail: "Tecnico registra ciencia offline e sincroniza quando recuperar conexao" },
];

export const fieldCloseoutPackage = [
  { title: "Evidencias", detail: "Fotos antes, durante e depois devem estar conferidas antes da assinatura" },
  { title: "Medicoes", detail: "Temperaturas, corrente e verificacoes tecnicas entram no relatorio" },
  { title: "Pecas", detail: "Baixa de estoque precisa ser confirmada quando houver consumo" },
  { title: "Relatorio", detail: "Texto tecnico deve ser revisado para ficar profissional" },
  { title: "Bloqueio", detail: "Assinatura fica travada enquanto houver pendencia obrigatoria" },
  { title: "Offline", detail: "Tecnico registra ciencia e sincroniza o fechamento quando recuperar conexao" },
];

export const fieldSignaturePackage = [
  { title: "Termos", detail: "Responsavel visualiza aceite da OS antes de assinar" },
  { title: "Campos", detail: "Nome, relacao com cliente e assinatura digital sao obrigatorios" },
  { title: "Documento", detail: "Documento do responsavel pode ser registrado quando aplicavel" },
  { title: "Copia", detail: "Tecnico confirma se o cliente recebera copia por e-mail" },
  { title: "Privacidade", detail: "Assinatura deve ser tratada como arquivo protegido" },
  { title: "Auditoria", detail: "Registro offline preserva horario, OS, orcamento e responsavel" },
];

export const completionEmailPackage = [
  { title: "Empresa", detail: "Envio principal usa e-mail configurado pela empresa" },
  { title: "Cliente", detail: "Copia ao cliente e opcional e depende da decisao registrada" },
  { title: "Anexos", detail: "Relatorio, evidencias e assinatura devem seguir juntos" },
  { title: "Bloqueio", detail: "E-mail final nao deve sair sem assinatura do cliente" },
  { title: "Retentativa", detail: "Falhas de envio precisam ficar na fila para nova tentativa" },
  { title: "Historico", detail: "Status de envio entra no historico da OS e do equipamento" },
];

export const executionSteps = [
  { title: "Check-in", detail: "Registrar chegada com localizacao" },
  { title: "Checklist", detail: "Responder itens obrigatorios" },
  { title: "Fotos", detail: "Antes, durante e depois" },
  { title: "Pecas", detail: "Informar consumo em campo" },
  { title: "Orcamento", detail: "Gerar aprovacao quando necessario" },
  { title: "Assinatura", detail: "Coletar aceite do cliente" },
];
