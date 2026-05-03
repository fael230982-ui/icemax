# Modelo De Dados Inicial

## Entidades Principais

ICEMAX sera o primeiro registro em `tenants`. Outras empresas serao novos registros na mesma tabela, com isolamento logico por `tenant_id`.

### tenants

Empresas que usam a plataforma.

- id
- name
- legal_name
- document
- logo_url
- primary_color
- secondary_color
- support_email
- report_email
- send_customer_copy_default
- created_at
- updated_at

### users

- id
- tenant_id
- name
- email
- phone
- password_hash
- role
- active
- created_at
- updated_at

Papeis iniciais:

- owner
- admin
- dispatcher
- supervisor
- technician
- outsourced_technician
- customer

### customers

- id
- tenant_id
- name
- document
- email
- phone
- notes
- created_at
- updated_at

### customer_addresses

- id
- tenant_id
- customer_id
- label
- street
- number
- complement
- district
- city
- state
- zip_code
- latitude
- longitude

### equipment

- id
- tenant_id
- customer_id
- address_id
- type
- brand
- model
- serial_number
- capacity_btu
- installation_location
- notes
- created_at
- updated_at

### service_orders

- id
- tenant_id
- customer_id
- equipment_id
- address_id
- assigned_technician_id
- opened_by_user_id
- title
- description
- priority
- status
- scheduled_start
- scheduled_end
- started_at
- arrived_at
- completed_at
- customer_signature_url
- customer_signed_name
- report_pdf_url
- send_copy_to_customer
- created_at
- updated_at

### service_contracts

Contratos fixos de manutencao recorrente.

- id
- tenant_id
- customer_id
- address_id
- name
- recurrence_months
- start_date
- end_date
- active
- includes_preventive
- includes_cleaning
- notes
- created_at
- updated_at

Recorrencias iniciais:

- 3 meses
- 4 meses
- 6 meses

### service_contract_equipment

Equipamentos cobertos por um contrato.

- id
- tenant_id
- contract_id
- equipment_id

### service_contract_visits

Visitas previstas e realizadas de contrato.

- id
- tenant_id
- contract_id
- service_order_id
- expected_date
- completed_date
- status
- notes

Status iniciais:

- planned
- scheduled
- completed
- overdue
- cancelled

Status iniciais:

- draft
- open
- scheduled
- en_route
- in_progress
- waiting_approval
- completed
- cancelled

Prioridades:

- low
- normal
- high
- emergency

### service_order_photos

- id
- tenant_id
- service_order_id
- type
- file_url
- caption
- created_by_user_id
- created_at

Tipos:

- before
- during
- after
- issue
- part

### service_order_notes

- id
- tenant_id
- service_order_id
- author_user_id
- raw_text
- improved_text
- ai_reviewed
- created_at

### checklist_templates

- id
- tenant_id
- name
- service_type
- active

### checklist_items

- id
- tenant_id
- template_id
- label
- required
- input_type
- sort_order

### service_order_checklist_answers

- id
- tenant_id
- service_order_id
- checklist_item_id
- value
- created_at

### parts

- id
- tenant_id
- sku
- name
- unit
- cost_price
- sale_price
- minimum_stock
- active

### stock_locations

- id
- tenant_id
- name
- type
- technician_user_id

Tipos:

- warehouse
- vehicle
- technician

### stock_movements

- id
- tenant_id
- part_id
- from_location_id
- to_location_id
- service_order_id
- quantity
- reason
- created_by_user_id
- created_at

### manuals

- id
- tenant_id
- title
- brand
- model
- equipment_type
- capacity_btu
- file_url
- tags
- created_at

### floor_plans

Plantas, mapas internos ou diagramas de localizacao por cliente/endereco.

- id
- tenant_id
- customer_id
- address_id
- name
- file_url
- width
- height
- created_at

### equipment_map_points

Pontos de equipamentos em plantas ou mapas.

- id
- tenant_id
- floor_plan_id
- equipment_id
- x_position
- y_position
- label
- created_at

### equipment_qr_labels

Etiquetas QR geradas para equipamentos.

- id
- tenant_id
- equipment_id
- code
- label_url
- qr_payload
- printed_at
- created_at

### technician_locations

- id
- tenant_id
- technician_user_id
- service_order_id
- latitude
- longitude
- accuracy
- captured_at

### audit_logs

- id
- tenant_id
- actor_user_id
- entity_type
- entity_id
- action
- metadata
- created_at
