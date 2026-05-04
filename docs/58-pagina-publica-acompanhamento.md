# 58 - Pagina Publica De Acompanhamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Criar a primeira experiencia visual do link publico de acompanhamento da OS, permitindo que o cliente acompanhe o atendimento sem acessar o painel administrativo.

## Entregas

- Rota web `/acompanhamento/[token]`.
- Leitura mock do token `track_<os>_<timestamp>`.
- Exibicao de status da OS.
- Cards de cliente, equipamento, tecnico e previsao.
- Linha do tempo do atendimento.
- Orientacoes para o cliente.
- Aviso de privacidade do link.
- Layout responsivo para celular e desktop.

## Experiencia Do Cliente

O cliente abre o link recebido por WhatsApp ou e-mail e visualiza o andamento da OS em linguagem simples. A tela evita termos internos e mostra apenas informacoes operacionais relevantes.

## Privacidade

A pagina informa que valores, notas internas e telefone pessoal do tecnico nao sao exibidos. Em producao, o token devera ser validado no backend antes de retornar dados reais.

## Proximos Passos

- Conectar a pagina ao endpoint real por token.
- Trocar dados mock por resposta protegida do backend.
- Criar expiracao visual para links vencidos.
- Registrar acessos na auditoria.
- Ajustar identidade visual por empresa whitelabel.
