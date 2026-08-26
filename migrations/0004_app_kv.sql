-- JSON partilhado (relatórios, IP, cópias) — funciona na Neon, em qualquer host.
create table if not exists app_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
