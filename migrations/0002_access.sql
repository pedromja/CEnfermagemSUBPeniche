-- Singleton site access policy (IP lock vs universal staff login).
create table if not exists site_settings (
  id text primary key,
  access_mode text not null default 'unset',
  allowed_ips text not null default '',
  staff_user text not null default '',
  staff_password_hash text not null default '',
  gate_secret text not null default '',
  updated_by text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id, access_mode)
values ('default', 'unset')
on conflict (id) do nothing;
