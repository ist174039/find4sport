alter table public.space_claims add column if not exists decision_reason text;
insert into storage.buckets (id, name, public) values ('claim-documents', 'claim-documents', false) on conflict (id) do update set public = false;
