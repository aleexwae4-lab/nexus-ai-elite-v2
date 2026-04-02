-- 🚀 SQL SCHEMA PARA AUTONOMOUS SAAS FORGE
-- Configuración de Supabase / PostgreSQL

create table users (
  id uuid primary key,
  email text unique,
  credits int default 10,
  created_at timestamp with time zone default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  repo text,
  url text,
  created_at timestamp with time zone default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  content text,
  created_at timestamp with time zone default now()
);

-- RLS Policies
alter table users enable row level security;
alter table projects enable row level security;
alter table leads enable row level security;

create policy "user owns profile" on users for all using (auth.uid() = id);
create policy "user owns projects" on projects for all using (auth.uid() = user_id);
create policy "user owns leads" on leads for all using (auth.uid() = user_id);
