# Diagnostico Da Plataforma

## Objetivo

Dar visibilidade profissional sobre maturidade, dependencias, papeis, modulos e bloqueios antes de homologacao ou producao.

## Endpoints

- `GET /platform/readiness`
- `GET /platform/modules`
- `GET /platform/roles`
- `GET /platform/diagnostics`

## Uso

O painel web possui acao de diagnostico que consulta os quatro endpoints em conjunto.

## Decisao Atual

O ambiente permanece em modo mock/local. Antes de producao, os principais bloqueios esperados sao banco PostgreSQL real, `JWT_SECRET` seguro e integracoes externas configuradas.
