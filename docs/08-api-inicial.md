# API Inicial

Base local prevista:

- `http://localhost:3333`

## Endpoints De Sistema

### GET /health

Verifica se a API esta ativa.

### GET /meta

Retorna metadados do produto e status suportados de OS.

## Tenant

### GET /tenant/current

Retorna a empresa atual. No MVP inicial, a ICEMAX e usada como tenant piloto.

## Dashboard

### GET /dashboard

Retorna indicadores principais, OS urgentes e visitas de contrato proximas.

## Ordens De Servico

### GET /service-orders

Lista ordens de servico.

### GET /service-orders/:id

Retorna detalhe de uma ordem de servico.

## Contratos

### GET /contracts

Lista contratos recorrentes.

### GET /contracts/due

Lista contratos com visitas proximas ou que precisam gerar OS.

## Mapas E Plantas

### GET /floor-plans

Lista plantas e pontos mockados de equipamentos.

## Etiquetas QR

### GET /qr-labels

Lista etiquetas QR geradas para equipamentos.

## Observacao

Os endpoints atuais usam dados mockados. A proxima etapa tecnica e conectar estes contratos de resposta ao Prisma/PostgreSQL, preservando as rotas.
