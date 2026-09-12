-- ============================================================
--  Fonti Cerdo de la 18 — Esquema de base de datos (Supabase)
--  Ejecuta en:  Supabase > SQL Editor > New query
--  Puedes ejecutarlo varias veces sin problema (usa IF NOT EXISTS).
-- ============================================================
create extension if not exists "pgcrypto";

-- -------- Productos (cortes de cerdo + otros) ---------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  price_per_kg integer not null,      -- precio en COP (por kg o por unidad según 'unit')
  methods      text[] default '{}',   -- guiso | parrilla | sarten | horno (solo cerdo)
  category     text default 'cerdo',  -- 'cerdo' | 'otros'
  unit         text default 'kg',     -- 'kg' (por peso) | 'unidad' (por cantidad)
  unit_label   text,                  -- unidad | cubeta | bolsa | paquete…
  image_url    text,
  sort         integer default 0,
  active       boolean default true,
  created_at   timestamptz default now()
);
-- columnas nuevas por si la tabla ya existía de antes:
alter table public.products add column if not exists category   text default 'cerdo';
alter table public.products add column if not exists unit        text default 'kg';
alter table public.products add column if not exists unit_label  text;
alter table public.products add column if not exists image_url   text;

-- -------- Pedidos -------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  customer_name  text not null,
  phone          text not null,
  delivery_type  text not null default 'delivery',
  address        text,
  neighborhood   text,
  notes          text,
  payment_method text not null default 'cash',
  subtotal       integer not null default 0,
  delivery_fee   integer not null default 0,
  total          integer not null default 0,
  status         text not null default 'nuevo'
);

-- -------- Ítems del pedido (peso o unidad) ------------------
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_slug  text not null,
  product_name  text not null,
  kind          text default 'weight',   -- 'weight' | 'unit'
  qty_kg        numeric(8,3),            -- si es por peso
  qty_units     numeric(8,2),            -- si es por unidad
  unit_label    text,
  unit_price    integer,                 -- precio por kg o por unidad
  unit_price_kg integer,                 -- compatibilidad
  line_total    integer not null
);
alter table public.order_items add column if not exists kind text default 'weight';
alter table public.order_items add column if not exists qty_units numeric(8,2);
alter table public.order_items add column if not exists unit_label text;
alter table public.order_items add column if not exists unit_price integer;
alter table public.order_items alter column qty_kg drop not null;
alter table public.order_items alter column unit_price_kg drop not null;

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_products_category on public.products(category);

-- ============================================================
--  Seguridad (RLS)
-- ============================================================
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Productos: lectura pública
drop policy if exists "productos_lectura_publica" on public.products;
create policy "productos_lectura_publica" on public.products
  for select to anon, authenticated using (active = true);

-- Productos: administración solo para usuarios autenticados (el dueño)
drop policy if exists "productos_admin_update" on public.products;
create policy "productos_admin_update" on public.products
  for update to authenticated using (true) with check (true);
drop policy if exists "productos_admin_insert" on public.products;
create policy "productos_admin_insert" on public.products
  for insert to authenticated with check (true);
drop policy if exists "productos_admin_delete" on public.products;
create policy "productos_admin_delete" on public.products
  for delete to authenticated using (true);
-- (para que el admin vea también los inactivos)
drop policy if exists "productos_admin_lectura" on public.products;
create policy "productos_admin_lectura" on public.products
  for select to authenticated using (true);

-- Pedidos: cualquiera puede crear; nadie los lee con la llave anónima
drop policy if exists "pedidos_crear" on public.orders;
create policy "pedidos_crear" on public.orders
  for insert to anon, authenticated with check (true);
drop policy if exists "items_crear" on public.order_items;
create policy "items_crear" on public.order_items
  for insert to anon, authenticated with check (true);

-- El dueño (autenticado) puede leer los pedidos
drop policy if exists "pedidos_admin_lectura" on public.orders;
create policy "pedidos_admin_lectura" on public.orders
  for select to authenticated using (true);
drop policy if exists "items_admin_lectura" on public.order_items;
create policy "items_admin_lectura" on public.order_items
  for select to authenticated using (true);
drop policy if exists "pedidos_admin_update" on public.orders;
create policy "pedidos_admin_update" on public.orders
  for update to authenticated using (true) with check (true);
