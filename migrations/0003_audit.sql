-- Audit trail of edits to already-filled days, and of deleted day records.
create table if not exists audit_log (
  id serial primary key,
  action text not null,
  report_date text not null,
  detail text not null default '',
  actor_ip text not null default '',
  occurred_at timestamptz not null default now()
);

create index if not exists audit_log_occurred_at_idx on audit_log (occurred_at desc);
