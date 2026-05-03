-- Schema conceitual inicial para ICEMAX.
-- A implementacao final deve ser convertida para migrations do ORM escolhido.

create table tenants (
  id uuid primary key,
  name text not null,
  legal_name text,
  document text,
  logo_url text,
  primary_color text default '#0B7CEB',
  secondary_color text default '#28D8FF',
  support_email text,
  report_email text,
  send_customer_copy_default boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  name text not null,
  email text not null,
  phone text,
  password_hash text not null,
  role text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table customers (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  name text not null,
  document text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customer_addresses (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  label text,
  street text not null,
  number text,
  complement text,
  district text,
  city text not null,
  state text not null,
  zip_code text,
  latitude numeric(10, 7),
  longitude numeric(10, 7)
);

create table equipment (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  address_id uuid references customer_addresses(id),
  type text not null,
  brand text,
  model text,
  serial_number text,
  capacity_btu integer,
  installation_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table floor_plans (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  address_id uuid references customer_addresses(id),
  name text not null,
  file_url text,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table equipment_map_points (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  floor_plan_id uuid not null references floor_plans(id),
  equipment_id uuid not null references equipment(id),
  x_position numeric(8, 4) not null,
  y_position numeric(8, 4) not null,
  label text,
  created_at timestamptz not null default now()
);

create table equipment_qr_labels (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  equipment_id uuid not null references equipment(id),
  code text not null,
  label_url text,
  qr_payload text not null,
  printed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table service_orders (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  equipment_id uuid references equipment(id),
  address_id uuid references customer_addresses(id),
  assigned_technician_id uuid references users(id),
  opened_by_user_id uuid references users(id),
  title text not null,
  description text,
  priority text not null default 'normal',
  status text not null default 'open',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  started_at timestamptz,
  arrived_at timestamptz,
  completed_at timestamptz,
  customer_signature_url text,
  customer_signed_name text,
  report_pdf_url text,
  send_copy_to_customer boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table service_contracts (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  address_id uuid references customer_addresses(id),
  name text not null,
  recurrence_months integer not null,
  start_date date not null,
  end_date date,
  active boolean not null default true,
  includes_preventive boolean not null default true,
  includes_cleaning boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (recurrence_months in (3, 4, 6))
);

create table service_contract_equipment (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  contract_id uuid not null references service_contracts(id),
  equipment_id uuid not null references equipment(id),
  unique (contract_id, equipment_id)
);

create table service_contract_visits (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  contract_id uuid not null references service_contracts(id),
  service_order_id uuid references service_orders(id),
  expected_date date not null,
  completed_date date,
  status text not null default 'planned',
  notes text
);

create table service_order_notes (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  service_order_id uuid not null references service_orders(id),
  author_user_id uuid references users(id),
  raw_text text,
  improved_text text,
  ai_reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

create table service_order_photos (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  service_order_id uuid not null references service_orders(id),
  type text not null,
  file_url text not null,
  caption text,
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now()
);

create table parts (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  sku text,
  name text not null,
  unit text not null default 'un',
  cost_price numeric(12, 2),
  sale_price numeric(12, 2),
  minimum_stock numeric(12, 3) default 0,
  active boolean not null default true
);

create table technician_locations (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  technician_user_id uuid not null references users(id),
  service_order_id uuid references service_orders(id),
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  accuracy numeric(10, 2),
  captured_at timestamptz not null
);
