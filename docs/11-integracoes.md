# Integracoes Externas

## O Que Sao Contas E Chaves

Algumas funcoes do ICEMAX dependem de servicos externos. Para o sistema usar esses servicos, sera necessario criar contas oficiais e gerar chaves de acesso. Essas chaves funcionam como senhas tecnicas da aplicacao e nunca devem ser publicadas no GitHub.

## OpenAI

Uso previsto:

- Revisar texto tecnico.
- Gerar resumo profissional da OS.
- Sugerir possiveis causas com base em foto e relato.
- Sugerir checklist.

O que sera necessario:

- Conta na plataforma da OpenAI.
- Projeto/API key.
- Configurar `OPENAI_API_KEY` no servidor.

Regra: a chave fica somente no back-end. Nunca fica no app mobile ou no navegador.

Referencia oficial: https://platform.openai.com/docs/quickstart/step-2-setup-your-api-key

## Google Maps Platform

Uso previsto:

- Exibir mapa no painel.
- Calcular tempo de deslocamento.
- Gerar sugestao de rota.
- Geocodificar endereco.
- Futuro: otimizar agenda com base em distancia e urgencia.

O que sera necessario:

- Conta Google Cloud.
- Projeto com faturamento ativo.
- APIs de mapas/rotas habilitadas.
- Uma ou mais API keys com restricoes.
- Configurar `MAPS_API_KEY` no servidor e, quando necessario, chave restrita para web/app.

Referencia oficial: https://developers.google.com/maps/documentation/routes/get-api-key

## WhatsApp

Uso previsto:

- Enviar link de acompanhamento da OS.
- Enviar link de aprovacao de orcamento.
- Avisar visita preventiva de contrato.
- Enviar lembrete de agendamento.
- Futuro: cliente abrir solicitacao via conversa.

O que sera necessario:

- Conta Meta Business.
- WhatsApp Business Platform ou provedor homologado.
- Numero de telefone configurado.
- Token de acesso.
- Phone Number ID.
- Webhook para receber eventos.
- Templates de mensagem aprovados quando exigido.

Regra: tokens ficam somente no back-end.

Referencia oficial: https://developers.facebook.com/docs/whatsapp/cloud-api

## E-mail

Uso previsto:

- Enviar relatorio PDF da OS.
- Enviar copia opcional ao cliente.
- Enviar orcamento.
- Enviar alertas internos.

Opcoes futuras:

- Amazon SES.
- SendGrid.
- Resend.
- SMTP corporativo.

O que sera necessario:

- Conta no provedor escolhido.
- Dominio validado.
- Chave/token SMTP/API.
- Configurar `EMAIL_FROM` e credenciais no servidor.

## Hospedagem

Uso previsto:

- Publicar API.
- Publicar painel web.
- Hospedar banco.
- Guardar fotos, PDFs, manuais e etiquetas.

Opcoes possiveis:

- Vercel para painel web.
- Render/Railway/Fly.io para API inicial.
- Supabase/Neon/Railway para PostgreSQL.
- AWS quando houver escala maior.

## Dominio

Uso previsto:

- Painel principal.
- Subdominios whitelabel.
- E-mail transacional validado.

Exemplos:

- `app.icemax.com.br`
- `api.icemax.com.br`
- `empresa-cliente.icemax.com.br`

## Regra De Seguranca

- Nenhuma chave real deve entrar no GitHub.
- Usar `.env.example` apenas com nomes das variaveis.
- Produção deve usar variaveis de ambiente do provedor de hospedagem.
- Chaves devem ser restritas por API, origem, IP ou pacote mobile sempre que possivel.

