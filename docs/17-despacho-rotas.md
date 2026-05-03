# Despacho, Rotas E Rastreamento

## Objetivo

A operacao precisa saber onde cada tecnico esta, qual OS deve ser atendida primeiro e como reduzir deslocamento sem prejudicar urgencias.

## Regras Iniciais

- Emergencias sempre entram antes de OS normais.
- Dentro da mesma prioridade, a distancia aproximada ordena a rota.
- O app tecnico envia localizacao com `technicianUserId`, latitude, longitude, precisao e OS relacionada.
- O painel visualiza a equipe e solicita rota sugerida.
- A localizacao deve respeitar consentimento, jornada de trabalho e LGPD.

## Implementacao Atual

Rotas adicionadas:

- `GET /technicians/locations`;
- `POST /technicians/:id/location`;
- `POST /dispatch/routes/optimize`.

O calculo atual usa distancia geodesica simples para desenvolvimento local. Isso evita custo com Google Maps enquanto a estrutura do produto esta sendo montada.

## Integracao Futura Com Mapas

Quando a conta de mapas for criada, a camada atual deve chamar:

- tempo real de deslocamento;
- matriz de distancia;
- geocodificacao de enderecos;
- mapa visual no painel;
- mapa e navegacao no app tecnico.

## Cuidados

- Nunca rastrear fora do horario autorizado.
- Permitir politica clara para tecnicos terceirizados.
- Registrar auditoria de envio de localizacao e otimizacao de rota.
- Evitar expor localizacao do tecnico para clientes sem regra explicita da empresa.
