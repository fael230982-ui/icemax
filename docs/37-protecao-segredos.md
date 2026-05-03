# Protecao Contra Segredos

## Objetivo

Evitar que chaves, tokens, senhas e credenciais sejam publicadas no GitHub por acidente.

## Regra Principal

Arquivos reais de ambiente nao devem ser versionados:

- `.env`
- `.env.local`
- `.env.production`
- qualquer variante `.env.*`, exceto `.env.example`

## Validacao Automatizada

O script `npm run guard:secrets` verifica os arquivos rastreados pelo Git e bloqueia:

- arquivo `.env` real versionado;
- chaves com padroes conhecidos, como OpenAI, GitHub, Google e Slack;
- blocos de chave privada;
- atribuicoes sensiveis com valores longos que parecem credenciais reais.

O comando `npm run validate` executa essa verificacao automaticamente antes de typecheck, testes e build.

## Como Trabalhar Com Chaves

1. Guardar valores reais apenas em arquivo `.env` local ou no painel da hospedagem.
2. Documentar somente nomes de variaveis em `.env.example`.
3. Usar valores vazios ou placeholders claros em exemplos.
4. Nunca colar token real em README, docs, issues, commits ou mensagens publicas.

## Antes De Push

Executar:

```bash
npm run validate
```

Se o guard falhar, remover o segredo do arquivo, trocar a chave no provedor e refazer o commit sem o valor sensivel.

