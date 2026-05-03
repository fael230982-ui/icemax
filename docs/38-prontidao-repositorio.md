# Prontidao Do Repositorio

## Objetivo

Criar uma checagem rapida para confirmar se o repositorio esta minimamente pronto para colaboracao, homologacao e publicacao controlada.

## Comando

```bash
npm run readiness
```

## O Que O Comando Verifica

- arquivos obrigatorios do projeto;
- scripts principais do `package.json`;
- workflow de CI;
- templates de pull request e issues;
- documentacao de publicacao e segredos;
- variaveis esperadas no `.env.example`;
- protecao de `.env` no `.gitignore`;
- pendencia de push inicial.

## Interpretacao

- `OK`: item pronto.
- `WARN`: item conhecido, mas ainda pendente por decisao operacional.
- `FAIL`: item precisa ser corrigido antes de push, homologacao ou release.

O push inicial deve continuar como `WARN` ate o Rafael autorizar o envio para o GitHub.

