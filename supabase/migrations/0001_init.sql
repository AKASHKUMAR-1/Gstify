-- Gstify initial schema: user profiles, clients, products, invoices,
-- subscriptions and transactions. Every table is owned by a Supabase
-- Auth user (auth.uid()) and locked down with Row Level Security so a
-- user can only ever see and modify their own rows.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text,
  gstin text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  gstin text,
  address text,
  state text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  rate numeric not null default 0,
  hsn_sac text,
  gst_percentage numeric not null default 18,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_number text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  status text not null default 'trial',
  razorpay_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id text,
  razorpay_payment_id text,
  amount numeric not null,
  currency text not null default 'INR',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists invoices_user_id_idx on public.invoices (user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists transactions_user_id_idx on public.transactions (user_id);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;

create policy "profiles_owner_all" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "clients_owner_all" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "products_owner_all" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "invoices_owner_all" on public.invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions_owner_all" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_owner_all" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
