# Frontend E API

## Decisao Atual

O painel web ainda renderiza dados locais para manter desenvolvimento rapido e sem depender de servidor rodando. Ao mesmo tempo, ja existe um cliente de API em `apps/web/lib/api.ts` para conectar o painel aos endpoints reais.

## Estrategia

1. Manter dados locais em `apps/web/app/data.ts` enquanto telas estao em evolucao.
2. Consumir API por `apps/web/lib/api.ts` quando o back-end estiver conectado ao banco.
3. Substituir cada bloco local por chamada real de forma incremental.
4. Preservar os contratos de resposta ja documentados em `docs/08-api-inicial.md`.

## Variavel De Ambiente

```bash
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

## Cuidados

- Dados sensiveis nunca devem ser expostos em variaveis `NEXT_PUBLIC_*`.
- Tokens de OpenAI, WhatsApp, e-mail e mapas do servidor nao entram no front-end.
- O painel pode receber chaves publicas restritas quando for necessario carregar mapas no navegador.

