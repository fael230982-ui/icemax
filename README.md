# ICEMAX

Plataforma whitelabel para gestao de ordens de servico, inicialmente focada em empresas de manutencao de ar-condicionado.

## Objetivo

Centralizar app tecnico, painel web, back-end, banco de dados, documentacao de produto e prototipos em um unico projeto.

## Estrutura

- `docs/`: documentacao de produto, arquitetura, roadmap e regras.
- `design/`: identidade visual, referencias e tokens de interface.
- `apps/`: painel web e prototipos.
- `mobile/`: aplicativo tecnico/cliente.
- `backend/`: API, regras de negocio e integracoes.
- `database/`: schema, migrations e dados iniciais.

## Lote Atual

Lote 1: definicao do produto, arquitetura inicial e prototipo estatico navegavel.

## Regras Do Projeto

- Projeto proprietario.
- Autoria: RAFAEL DA SILVA BEZEERA.
- Nao publicar segredos, chaves, tokens ou credenciais.
- Revisar texto, acentuacao e experiencia do usuario antes de publicar.
- Atualizar `CHECKLIST.md` antes de push, homologacao e release.
- Atualizar `CHANGELOG.md` em releases relevantes.

## Decisao De Produto

O produto sera construido como multiempresa desde o primeiro dia. Mesmo que a primeira operacao seja ICEMAX, a base tecnica precisa suportar whitelabel, separacao de dados por empresa, personalizacao de marca e perfis diferentes de usuarios.
