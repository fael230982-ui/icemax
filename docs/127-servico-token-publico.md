# Servico De Token Publico

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Transformar links publicos do portal do cliente em um fluxo seguro, preparado para banco real e whitelabel, sem persistir token cru.

## O Que Foi Implementado

- Servico de criacao de token opaco com entropia forte.
- Hash SHA-256 com pepper de servidor antes de qualquer persistencia real.
- Repositorio Prisma para gravar `PublicAccessToken` com tenant, escopo, entidade, expiracao e metadados seguros.
- Em modo mock, a API retorna apenas preview de hash para demonstracao e homologacao.
- Links de acompanhamento de OS e resumo de contrato agora usam o mesmo contrato de seguranca.
- Endpoint `GET /customer-portal/:tenantSlug/public-token-policy` documenta regras de seguranca para o portal.

## Decisoes De Seguranca

- O token cru e retornado somente no momento da criacao do link.
- O banco real deve persistir somente o hash.
- Cada token pertence a um tenant, escopo e entidade.
- Links expiram automaticamente e podem ser revogados.
- Dados financeiros continuam exigindo confirmacao de identidade do cliente em producao.
- Link publico nao deve expor assinatura, fotos sensiveis, relatorio completo, dados financeiros ou notas internas.

## Variaveis De Ambiente Futuras

- `APP_PUBLIC_URL`: URL publica usada para montar links enviados ao cliente.
- `PUBLIC_ACCESS_TOKEN_PEPPER`: segredo de servidor usado para fortalecer o hash do token publico.

Essas variaveis ainda nao devem receber valores reais no repositorio. Valores reais devem ficar apenas no ambiente seguro de hospedagem.

## Proximos Passos

- Criar fluxo de revogacao administrativa.
- Validar abertura real do link contra hash salvo.
- Auditar cada acesso ao link publico.
- Aplicar rate limit por IP, tenant e token.
- Adicionar confirmacao de identidade antes de exibir dados financeiros reais.
