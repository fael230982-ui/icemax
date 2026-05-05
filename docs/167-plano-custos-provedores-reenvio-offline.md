# Plano De Custos E Provedores Do Reenvio Offline

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento organiza as contas e provedores que precisam existir antes de liberar o reenvio offline com execucao real. Ele nao inclui precos fixos, chaves, tokens, senhas ou credenciais.

## Objetivo

O plano transforma a lista de infraestrutura pendente em uma visao de decisao: qual provedor sera necessario, qual modelo de custo precisa ser acompanhado, qual teto mensal deve ser aprovado e qual segredo deve ficar fora do repositorio.

## Endpoint

- `GET /platform/mobile-offline-escalations/provider-cost-plan`

## Provedores Mapeados

- `database`: banco gerenciado para tenants, OS, evidencias, auditoria e idempotencia.
- `hosting_domain`: hospedagem, dominio, SSL, variaveis de ambiente e publicacao.
- `email_provider`: e-mail transacional para conclusao de OS, copia ao cliente e notificacoes.
- `maps_provider`: mapas, rotas, geocodificacao, tempo de deslocamento e apoio ao rastreamento.
- `ai_provider`: revisao de texto, diagnostico visual e padronizacao de relatorios.
- `whatsapp_provider`: notificacoes e comunicacao operacional futura.

## Politica De Custos

- Nao registrar precos fixos na base do projeto.
- Validar valores somente no painel oficial de cada provedor no momento da contratacao.
- Definir teto mensal antes de ativar qualquer integracao externa.
- Ativar alertas de uso, cota, armazenamento, trafego e mensagens.
- Separar custo por tenant quando o whitelabel entrar em operacao comercial.

## Politica De Segredos

- Nenhum segredo deve entrar em documento, commit, log ou print.
- `DATABASE_URL`, `OPENAI_API_KEY`, chaves de mapa, SMTP/API de e-mail e tokens Meta/WhatsApp devem ficar apenas no provedor de hospedagem ou cofre seguro.
- O reenvio real permanece bloqueado ate que banco, auditoria, permissoes e provedores criticos estejam homologados.

## Ordem Recomendada

1. Banco real.
2. Hospedagem, dominio e SSL.
3. E-mail transacional.
4. Mapas e rotas.
5. IA de texto e imagem.
6. WhatsApp.

## Proxima Acao

Quando chegar a fase de homologacao externa, escolher os provedores, aprovar teto mensal e cadastrar as variaveis reais apenas no ambiente seguro. Depois disso, reexecutar `npm run validate` e os gates de prontidao.
