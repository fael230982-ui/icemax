# Politica De Compartilhamento Externo

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

A politica de compartilhamento externo define o que pode sair da plataforma ICEMAX por e-mail, portal do cliente, link publico e WhatsApp.

Ela protege relatorios, fotos, assinaturas, dados financeiros, notas internas e informacoes da equipe tecnica antes da operacao em producao.

## Endpoint

`GET /customer-portal/:tenantSlug/external-sharing-policy`

O retorno inclui:

- decisao padrao para dados sensiveis;
- canais permitidos;
- cargas autorizadas por canal;
- cargas bloqueadas por canal;
- controles obrigatorios;
- regras para evidencias;
- resumo de canais;
- governanca.

## Regras Principais

1. Link publico nao deve carregar fotos, assinatura, relatorio completo ou dados financeiros.
2. E-mail pode enviar relatorio e garantia apenas por fila auditada e destinatario validado.
3. Portal pode exibir documentos aprovados com token expiravel e auditoria.
4. WhatsApp deve ser usado para links, agenda e avisos, evitando anexos sensiveis diretos.
5. Manifesto de evidencias e storage privado sao obrigatorios para arquivos sensiveis.

## Impacto Operacional

Essa politica evita que o sistema fique dependente de decisao manual caso a equipe queira enviar relatorio, comprovante, foto ou resumo financeiro. O produto passa a declarar o que e permitido, o que e bloqueado e quais controles ainda precisam existir antes de producao.
