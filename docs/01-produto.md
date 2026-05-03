# Produto ICEMAX

## Resumo

ICEMAX sera a empresa piloto da plataforma de ordem de servico para empresas de instalacao e manutencao de ar-condicionado. A mesma base podera ser vendida como whitelabel para outras assistencias tecnicas, com marca, cores, usuarios, checklists e relatorios personalizados.

Regra de produto: ICEMAX nao deve ficar fixo no codigo, no banco ou nas regras da aplicacao. ICEMAX sera apenas o primeiro cadastro de empresa, tambem chamado de primeiro tenant.

## Publicos

- Dono da empresa: acompanha operacao, produtividade, receita, clientes e indicadores.
- Administrador: cadastra usuarios, clientes, equipamentos, pecas, agenda e OS.
- Supervisor tecnico: distribui servicos, acompanha tecnicos e revisa atendimentos.
- Tecnico interno: executa OS pelo aplicativo.
- Tecnico terceirizado: recebe apenas OS atribuidas, com permissao limitada.
- Cliente: pode abrir solicitacao, acompanhar OS, aprovar orcamento e assinar atendimento.

## Proposta De Valor

- Reduzir desorganizacao operacional.
- Padronizar relatorios tecnicos.
- Registrar fotos, assinatura e historico por aparelho.
- Melhorar agenda e deslocamento de tecnicos.
- Controlar pecas usadas em campo.
- Dar aparencia profissional ao atendimento.
- Permitir que outras empresas usem o sistema com a propria marca.

## Modulos

### Ordem De Servico

- Criacao pela empresa no painel web.
- Criacao opcional pelo cliente via portal ou link.
- Classificacao por tipo, urgencia, status e equipamento.
- Historico das ultimas OS do cliente e do equipamento.
- Checklists por tipo de servico.
- Fotos antes, durante e depois.
- Diagnostico e servico executado.
- Pecas usadas.
- Assinatura do cliente.
- PDF automatico ao concluir.
- Envio por e-mail para empresa e copia opcional para cliente.

### Contratos De Manutencao

- Cliente pode contratar manutencoes fixas ao longo do ano.
- Ciclos iniciais: a cada 3 meses, 4 meses ou 6 meses.
- Contrato pode incluir manutencao preventiva, higienizacao ou ambos.
- Sistema deve controlar proxima visita prevista.
- Sistema deve gerar ou sugerir OS preventiva antes da data.
- Dashboard deve mostrar contratos ativos, proximas visitas e visitas vencidas.
- Historico do contrato deve mostrar OS executadas, pendentes e reagendadas.

### Agenda

- Agenda manual no MVP.
- Visualizacao por tecnico, data e status.
- Integracao com mapa para abrir rota.
- Geracao de agenda preventiva a partir dos contratos fixos.
- Futuro: sugestao de tecnico por localizacao, tempo livre, urgencia e especialidade.
- Futuro: roteirizacao automatica.

### Rastreamento

- Ultima localizacao conhecida no MVP avancado.
- Rastreamento durante OS ativa ou horario de trabalho.
- Consentimento obrigatorio do tecnico.
- Politica de privacidade e registro de permissao.

### Estoque

- Cadastro de pecas.
- Estoque geral e estoque por tecnico/veiculo.
- Baixa automatica por OS.
- Estoque minimo.
- Custo, preco de venda e margem.
- Transferencia entre almoxarifado e tecnico.

### IA

- Revisao de texto tecnico para tom profissional.
- Resumo automatico da OS.
- Sugestao de possiveis causas com base em foto e descricao.
- Sugestao de checklist conforme tipo de atendimento.
- Importante: a IA deve apoiar o tecnico, nao substituir diagnostico.

### Manuais

- Biblioteca por marca, modelo, capacidade e tipo de equipamento.
- Acesso no app tecnico.
- Busca por texto.
- Anexos PDF.

### Mapas Interativos E Plantas

- Visualizacao de plantas dos clientes no painel web e no app.
- Marcacao da localizacao dos equipamentos dentro da planta.
- Ponto do equipamento com identificacao, historico, manuais e OS relacionadas.
- Apoio para clientes com muitos aparelhos, como hoteis, clinicas, mercados e condominios.
- Futuro: abrir OS diretamente a partir do ponto no mapa/planta.

### Etiquetas Com QR Code

- Geracao de etiqueta QR por equipamento.
- QR deve abrir ficha do equipamento, historico e opcao de nova OS.
- Etiqueta pode incluir nome da empresa, codigo do equipamento, local de instalacao e QR.
- Impressao em lote por cliente, contrato ou local.
- Leitura pelo app tecnico.

### Whitelabel

- Nome da empresa.
- Logo.
- Cores.
- E-mails de notificacao.
- Texto padrao de relatorio.
- Termos de garantia.
- Tipos de servico.
- Checklists personalizados.
- Usuarios e permissoes.
