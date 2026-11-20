-- Incolla in Supabase: SQL Editor -> New query -> Run
create table if not exists accessi (
  email text primary key,
  qualificata boolean not null default false,
  token text,
  token_scade timestamptz,
  creato timestamptz not null default now()
);
-- Blocca l'accesso pubblico alla tabella (il sito usa la chiave "service_role" lato server)
alter table accessi enable row level security;
