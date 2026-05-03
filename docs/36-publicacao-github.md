# Publicacao No GitHub

## Objetivo

Padronizar como o projeto ICEMAX deve ser publicado, revisado e validado no GitHub sem expor informacoes sensiveis e sem perder controle de qualidade.

## Repositorio

- Repositorio remoto: `https://github.com/fael230982-ui/icemax`
- Branch principal: `main`
- Titular/autoria: RAFAEL DA SILVA BEZEERA
- E-mail de autoria: `adm.rcsolutions@gmail.com`

## Estrategia De Branches

- `main`: somente codigo validado e pronto para backup/publicacao controlada.
- `fase-*`: branches de trabalho para blocos maiores de implementacao.
- `hotfix/*`: correcoes urgentes quando houver ambiente publicado.

## Antes De Push

1. Revisar se nao existem segredos em arquivos versionados.
2. Conferir alteracoes com `git status --short`.
3. Executar `npm run validate`.
4. Atualizar `CHECKLIST.md`.
5. Atualizar `CHANGELOG.md` quando a alteracao for relevante.
6. Confirmar que PDFs estao adiados quando a prioridade for velocidade.

## Validacao Automatizada

O GitHub Actions executa `npm run validate` em pull requests e pushes para `main`.

Esse comando cobre:

- geracao do Prisma Client;
- typecheck dos workspaces;
- testes automatizados disponiveis;
- build do painel web.

## Segredos E Chaves

Nao publicar:

- chaves OpenAI;
- tokens Meta/WhatsApp;
- chaves Google Maps;
- senhas de banco;
- credenciais SMTP;
- tokens de hospedagem;
- arquivos `.env` reais.

Usar `.env.example` para nomes de variaveis e documentacao.

## Publicacao Inicial Recomendada

Quando o Rafael autorizar o primeiro envio:

```bash
git status --short
npm run validate
git push -u origin main
```

Depois do primeiro push, abrir o repositorio no GitHub e conferir:

- workflow `Validate`;
- arquivos de documentacao;
- templates de issue e pull request;
- ausencia de segredos;
- historico de commits preservando a autoria.

## Homologacao

Antes de liberar para teste real:

- executar o gate de pre-release no painel;
- revisar o diagnostico de plataforma;
- validar fluxos de OS, cliente, tecnico, estoque, contrato, rastreamento, assinatura, relatorio e notificacoes;
- registrar pendencias como issues no GitHub.

